var Moment = require( 'moment' ),
	async = require( 'async' );

function TwitterDirectMessageTranslator() {
}
TwitterDirectMessageTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '/direct/[A-Za-z]+' ];
}
TwitterDirectMessageTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
	var self = this;
	try {
		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
		var source = parsedUri[3];

		var translatedMessages = new Array();

		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
		// spec (opensocial-social-data-specification-2-5-0-draft):
		// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
		async.eachSeries(
			rawDoc.data,
			function( data, done ) {
    			try
				{
					var uri = 'apinetwork://' + owner + '//@' + source + '/user/' + data.sender.id;
					var outputData = {
						'sourceUri': sourceUri,
						'uri': uri,
						'owner': owner,
						'category': 'person',
						'data': self.translateUser( uri, data.sender )
					};

					uri = 'apinetwork://' + owner + '//@' + source + '/user/' + data.recipient.id;
					var outputData = {
						'sourceUri': sourceUri,
						'uri': uri,
						'owner': owner,
						'category': 'person',
						'data': self.translateUser( uri, data.recipient )
					};
					var translatedMessage = self.translateMessage( owner, source, data );
					translatedMessages.push( translatedMessage );

					var outputData = {
						'sourceUri': sourceUri,
						'uri': 'apinetwork://' + owner + '//@' + source + '/direct/' + data.id,
						'owner': owner,
						'category': 'message',
						'data': translatedMessage,
						'time': Moment( translatedMessage.timeSent ).valueOf()
					};
					done();
				}
				catch( error )
				{
					done( error );
				}
			},
			function( error ) {
				process.nextTick( function() {
					callback( error, translatedMessages );
				});
			}
		);
    }
	catch( error )
	{
		callback( error );
	}
};
TwitterDirectMessageTranslator.prototype.translateUser = function( uri, rawUser ) {
	return { 
		// Required fields by spec
		'id': uri,
		'displayName': {'formatted': rawUser.name },

		// Additional required fields for UI
		'preferredUsername': '@' + rawUser.screen_name,
		'thumbnailUrl': rawUser.profile_image_url,
		'appData': { 
			'serviceName': 'Twitter',
			'serviceImgUrl': '/512x512-logos/twitter.png',
			// Plus other app data that isn't required.
			'verified': rawUser.verified,
		},

		// Everything else
		'location': rawUser.location,
		'aboutMe': rawUser.description,
		'urls': [ rawUser.url ],
		'utcOffset': rawUser.utc_offset,
		'languagesSpoken': [ rawUser.lang ],
	 };
};
TwitterDirectMessageTranslator.prototype.translateMessage = function( owner, source, rawMessage ) {
	return {
				'appData': {
                        		'serviceName': 'Twitter'
				},
				'body': rawMessage.text,
				'id': 'apinetwork://' + owner + '//@' + source + '/direct/' + rawMessage.id,
				'recipients': [ 'apinetwork://' + owner + '//@' + source + '/user/' + rawMessage.recipient_id ],
				'senderId': 'apinetwork://' + owner + '//@' + source + '/user/' + rawMessage.sender_id,
				'timeSent': rawMessage.created_at,
				'itemtype': 'Twitter Direct Message'
			};
};
module.exports = exports = TwitterDirectMessageTranslator;
