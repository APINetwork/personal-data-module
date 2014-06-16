var Moment = require( 'moment' );
var MailParser = require( 'mailparser' ).MailParser;
var _ = require( 'underscore' );

function ImapMessageTranslator() {
}
ImapMessageTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/message/.*' ];
}
ImapMessageTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	var self = this;
	try {
		if( rawDoc.data )
		{
			var parsedUri = uri.match( /[^:]*:\/\/.*\/\/@([^\/]*)\/message\/.*/ );
			var source = parsedUri[1];
			
			var parser = new MailParser();
			parser.on( "end", function( parsedMessage ) {

				var translatedMessages = [];
				var accountUri = 'apinetwork://' + owner + '//@' + source;
				
				parsedMessage[ 'x-gm-thrid' ] = rawDoc.data[ 'x-gm-thrid' ]; 
				parsedMessage[ 'x-gm-msgid' ] = rawDoc.data[ 'x-gm-msgid' ];
				parsedMessage[ 'x-gm-labels' ] = rawDoc.data[ 'x-gm-labels' ];
				
				var msg = self.translateMessage( uri, accountUri, parsedMessage  );

				var data = {
						'uri': uri,
						'data': msg,
						'category': 'message'
					};
				if( msg.updated )
					data.time = msg.updated;
				else
					data.time = 0;
				
				process.nextTick( function() {
            		callback( error, data.data );
	        	});

			});

			for( var i in rawDoc.data.chunks )
			{
				parser.write( rawDoc.data.chunks[i] );
			}
			parser.end();
		}
		else
		{
			var error = new Error( 'No message data received for uri: ' + uri );
			callback( error, null );
		}

	} catch( err ) {
        callback( err , null );
	}
};

//publish a contact found as an email in a message 'from' or 'to' or 'cc' field
ImapMessageTranslator.prototype.publishContact = function( uri, untranslatedContact ) {
	var parsedUri = uri.match( /[^:]*:\/\/.*\/\/@acct:((imap)|(gmail)):[^\/]+\// );

	var email = untranslatedContact.address;

	var contact = {
		"id": uri,
		"appData": {
			'serviceName': parsedUri[ 1 ]
		}
	}
	if( untranslatedContact.name )
		contact.displayName = {
			"formatted": untranslatedContact.name
		};
	if( untranslatedContact.address )
		contact.emails = [ untranslatedContact.address ];

	var userData = {
		'uri': uri,
		'data': contact,
		'category': 'person'
	};
}

ImapMessageTranslator.prototype.convertToEmailAddrStr = function(emailAddr ) {
	var emailStr = emailAddr.name + " <" + emailAddr.address + ">";
	return emailStr;
}


ImapMessageTranslator.prototype.translateMessage = function( uri, accountUri, entireMessage) {
	var parsedUri = uri.match( /[^:]*:\/\/.*\/\/@acct:((imap)|(gmail)):[^\/]+\// );
	var msg = {
        	'id': uri + '/',
        	"appData": {
                 	'serviceName': parsedUri[ 1 ]
                 },
                'itemtype': 'email',
	}

	if( entireMessage.text )
		msg['body'] = entireMessage.text;

	if( entireMessage.html )
		msg[ 'bodyhtml' ] = entireMessage.html;

	if( _.isArray( entireMessage.from ))
	{
		msg.senderId = accountUri + '/contacts/' + entireMessage.from[0].address;
		this.publishContact( msg.senderId, entireMessage.from[0] );
	}

	if( _.isString( entireMessage.subject ))
		msg.title = entireMessage.subject;

	msg.messageid = entireMessage.headers["message-id"];

	if( entireMessage[ 'x-gm-thrid'] )
		msg.gmthrid = entireMessage[ 'x-gm-thrid' ];

	if( entireMessage[ 'x-gm-msgid' ] )
		msg.gmmsgid = entireMessage[ 'x-gm-msgid' ];

	if( entireMessage[ 'x-gm-labels' ] )
		msg.gmlabels = entireMessage[ 'x-gm-labels' ];

	var recipients = [];
	var torecipients = [];
	var ccrecipients = [];
	var bccrecipients = [];
	if( entireMessage.to )
		for( var i in entireMessage.to )
		{
			var contactUri = accountUri + '/contacts/' + entireMessage.to[i].address;
			recipients.push( contactUri );
			torecipients.push( this.convertToEmailAddrStr(entireMessage.to[i]));
			this.publishContact( contactUri, entireMessage.to[ i ] );
		}
	if( entireMessage.cc )
		for( var i in entireMessage.cc )
		{
			var contactUri = accountUri + '/contacts/' + entireMessage.cc[i].address;
			recipients.push( contactUri );
			ccrecipients.push( this.convertToEmailAddrStr(entireMessage.cc[i]));
			this.publishContact( contactUri, entireMessage.cc[i] );
		}
	if( entireMessage.bcc )
		for( var i in entireMessage.bcc )
		{
			var contactUri = accountUri + '/contacts/' + entireMessage.bcc[i].address;
			bccrecipients.push( this.convertToEmailAddrStr(entireMessage.bcc[i]));
			this.publishContact( contactUri, entireMessage.bcc[i] );
		}
	msg.recipients = recipients;
	msg.torecipients = torecipients;
	msg.ccrecipients = ccrecipients;
	msg.bccrecipients = bccrecipients;

	if( entireMessage.headers.date )
		msg.timeSent = Moment( entireMessage.headers.date ).valueOf();

	if( entireMessage.inReplyTo )
		msg.inReplyTo = accountUri + '/message/' + entireMessage.inReplyTo;

	return msg;
}
module.exports = exports = ImapMessageTranslator;
