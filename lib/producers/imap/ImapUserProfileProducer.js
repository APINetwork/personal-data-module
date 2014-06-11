var base = require( '../ProducerBase.js' );

function ImapUserProfileProducer( fetcher ) {
	this.fetcher = fetcher;
    base.init( this );
}
base.inherit( ImapUserProfileProducer );

ImapUserProfileProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:imap:.+', '/user/.+' ];
}
ImapUserProfileProducer.prototype.attemptRequest = function( tokenStore, uri, userId, source, resource, connectionInfo, callback ) {
	try {
		tokenStore.getUserTokens( userId, source, function( error, data ) {
			if( error )
			{
				callback( error );
			}
			else
			{
				try {
					callback( null, {
						'username': data.connectionData.username,
						'server': data.connectionData.server,
						'port': data.connectionData.port,
						'secure': data.connectionData.secured
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
module.exports = exports = ImapUserProfileProducer;
