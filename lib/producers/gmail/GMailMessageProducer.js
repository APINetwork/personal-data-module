var base = require( '../ProducerBase.js' );
var ImapService = require( '../imap/ImapService.js' );

function GMailMessageProducer( fetcher ) {
    this.fetcher = fetcher;
    base.init( this );
}
base.inherit( GMailMessageProducer );

GMailMessageProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/message/x-gm-msgid/[0-9]+$' ];
}
GMailMessageProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
	var self = this;
	var parsedResource = resource.match( /\/message\/x-gm-msgid\/([0-9]+)$/ );
	var messageId = parseInt( parsedResource[1] );

	ImapService.searchForMessages( owner, keys, "[Gmail]/All Mail", [ [ 'X-GM-MSGID', messageId ] ], 
        function( error, data ){
            if( error )
                callback( error, null );
            else if( data[0] )
            {
                callback( null, {
                    'uri': uri, 
                    'data': data[0]
                });
            }
            else
            {
                var error = new Error( '(GMailMessageProducer) Undefined message data[0] for uri: ' + uri );
                error.data = data;
                error.uri = uri;
                callback( error, null );
            }
        } );
};

module.exports = exports = GMailMessageProducer;
