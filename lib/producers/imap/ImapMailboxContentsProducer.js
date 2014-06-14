var Moment = require( 'moment' );
var base = require( '../ProducerBase.js' );
var ImapService = require( './ImapService.js' );

function ImapMailboxContentsProducer( fetcher ) {
	this.fetcher = fetcher;
    base.init( this );
}
base.inherit( ImapMailboxContentsProducer );

ImapMailboxContentsProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/mailbox/[^_].*' ];
}
ImapMailboxContentsProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source, resource, keys, callback ) {
	var self = this;
	var mailboxName = null;

	var sinceMatch = resource.match( '\\?since=([0-9]+)' );
	var since = null;
	if( sinceMatch != null )
	{
		since = parseInt( sinceMatch[1] );
		mailboxName = resource.match( '/mailbox/([^_].*)\\?since=[0-9]+' )[1];
	}
	else
	{
		mailboxName = resource.match( '/mailbox/([^_].*)' )[1];
	}

	var query;
	if( since )
		query = [[ 'SINCE', new Date( since )]];
	else 
		query = [ 'ALL' ];

	try {
		tokenStore.getUserTokens( owner, source, function( error, data ) {
			if( error )
			{
				callback( error );
			}
			else
			{
				try {

					ImapService.searchForIDs( owner, data.connectionData, mailboxName, query, 
				        function( error, data ){
				            if( error ) {
				                callback( error, null );
							}
				            else
				            {
				                callback( null, {
				                    'uri': uri, 
				                    'data': data
				                });
				            }
				        } );
				} catch( err ) {
					callback( err );
				}
			}
		} );

	} catch( err ) {
		callback( err );
	} 
};
module.exports = exports = ImapMailboxContentsProducer;
