var base = require( '../ProducerBase.js' );
var ImapService = require( './ImapService.js' );
var async = require( 'async' );

function ImapMessageProducer( fetcher ) {
    this.fetcher = fetcher;
    base.init( this );
}
base.inherit( ImapMessageProducer );

ImapMessageProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/message/.*/message-id/[^/]*$' ];
}
ImapMessageProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source, resource, keys, callback ) {
	var self = this;
	var parsedResource = resource.match( /\/message\/(.*)\/message-id\/([^\/]*)$/ );
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

                	ImapService.searchForMessages( owner, data.connectionData, mailbox, [[ 'HEADER', 'Message-ID', messageId ]], 
                        function( error, data ){
                            if( error )
                            {
                                callback( error, null );
                            }
                            else
                            {
                                if( data.length < 1 )
                                {
                                    self._linearSearchOfMessageIds( owner, data.connectionData, mailbox, messageId,
                                        function( error, messageSeqNumber ) {
                                            if( error )
                                                callback( error );
                                            else if( messageSeqNumber >= 0 ) {
                                                ImapService.fetchBySeqNo( owner, data.connectionData, mailbox, messageSeqNumber,
                                                    function( error, data ) {
                                                        if( error )
                                                            callback( error );
                                                        else if( data )
                                                            callback( null, {
                                                                'uri': uri, 
                                                                'data': data[0]
                                                            });
                                                        else
                                                        {
                                                            var error = new Error( '(ImapMessageIdMessageProducer) Undefined message data[0] for uri: ' + uri );
                                                            error.data = data;
                                                            error.uri = uri;
                                                            callback( error, null );
                                                        }
                                                    }
                                                );
                                            }
                                            else
                                            {
                                                callback( new Error( 'No message found for ' + uri ));
                                            }
                                        } );
                                }
                                else
                                {
                                    callback( null, {
                                        'uri': uri, 
                                        'data': data[0]
                                    });                    
                                }
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

ImapMessageProducer.prototype._linearSearchOfMessageIds = function( owner, keys, mailbox, messageId, callback ) {
    ImapService.searchForIDs( owner, keys, mailbox, [ 'ALL' ], 
        function( error, data ){
            if( error ) {
                callback( error, null );
            }
            else
            {
                if( data && data.length > 0 )
                {
                    // Asynchronous loop so we don't monopolize the thread if the mailbox is big.
                    async.forEachSeries( 
                        data,
                        function( item, done ) {
                            if( item[ 'message-id' ] == messageId )
                            {
                                done( item.seqno );
                            }
                            else
                            {
                                process.nextTick(
                                    function() {
                                        done();
                                    }
                                );
                            }
                        },
                        function( result ) {
                            callback( null, ( typeof result == 'number' ? result : -1 ));
                        }
                    )
                }
                else
                {
                    callback( null, -1 );
                }
            }
        } );
}

module.exports = exports = ImapMessageProducer;
