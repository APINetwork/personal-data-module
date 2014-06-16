function ImapMailboxContentsTranslator() {
}
ImapMailboxContentsTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/mailbox/[^_].*' ];
}
ImapMailboxContentsTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	try {
		var parsedUri = uri.match( /[^:]*:\/\/.*\/\/@([^\/]*)\/mailbox\/([^_][^?]*)(\?since=([0-9]+))?/ );

		var source = parsedUri[1];
		var mailboxName = parsedUri[2];
		var messageUris = new Array();


		for( var i=0; i<rawDoc.data.length; i++ )
		{
			var messagePath = null;
			if( rawDoc.data[i][ 'x-gm-msgid' ] )
				messagePath = 'x-gm-msgid/' + rawDoc.data[i][ 'x-gm-msgid' ];
			else if( rawDoc.data[i][ 'message-id' ] )
				messagePath = mailboxName + '/message-id/'+ rawDoc.data[i][ 'message-id' ];
			else if( rawDoc.data[i].uid )
				messagePath = mailboxName + '/uid/' + rawDoc.data[i].uid;
			else
				messagePath = mailboxName + '/' + rawDoc.data[i].seqno;
			messageUris.push( 
				'apinetwork://' + owner + '//@' + source + '/message/' + messagePath
			);
		}

		var outputData = {
			'uri': uri,
			'owner': owner,
			'category': 'messageList',
			'data': messageUris
		};
    	process.nextTick( function() {
    		callback( null, outputData.data );
    	});
	} catch( err ) {
    	callback(  err , null );
	}
};
module.exports = exports = ImapMailboxContentsTranslator;
