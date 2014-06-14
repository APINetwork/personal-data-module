var base = require( '../ProducerBase.js' );
var ImapService = require( './ImapService.js' );

function ImapMessageProducer( fetcher ) {
    this.fetcher = fetcher;
    base.init( this );
}
base.inherit( ImapMessageProducer );

ImapMessageProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/message/[^/]*/uid/[^/]*$' ];
}
ImapMessageProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source, resource, keys, callback ) {
	var self = this;
	var parsedResource = resource.match( /\/message\/([^\/]*)\/uid\/([^\/]*)$/ );
    var mailbox = parsedResource[1];
	var messageId = parsedResource[2];

    try {
        tokenStore.getUserTokens( owner, source, function( error, data ) {
            if( error )
            {
                callback( error );
            }
            else
            {
                try {

                    ImapService.fetch( owner, keys, mailbox, messageId, 
                        function( error, data ){
                            if( error )
                                callback( error, null );
                            else if( data )
                            {
                                callback( null, {
                                    'uri': uri, 
                                    'data': data[0]
                                });
                            }
                            else
                            {
                                var error = new Error( '(ImapUidMessageProducer) Undefined message data for uri: ' + uri );
                                error.data = data;
                                error.uri = uri;
                                callback( error, null );
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

module.exports = exports = ImapMessageProducer;
