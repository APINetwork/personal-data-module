var util = require( 'util' );
var base = require( '../ProducerBase.js' );
var ImapService = require( './ImapService.js' );

function ImapMailboxListProducer( fetcher ) {
	this.fetcher = fetcher;
    base.init( this );
}
base.inherit( ImapMailboxListProducer );

ImapMailboxListProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/mailbox/_index' ];
}
ImapMailboxListProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
	var self = this;

	ImapService.getMailboxes( owner, keys, 
	    function( error, data ){
	        if( error )
	            callback( error.finalError, null );
	        else
	            callback( null, {
	                'uri': uri, 
	                'data': data
	            });
	    }
    );
};
ImapMailboxListProducer.prototype.removeParentPointers = function( item ) {
	if( typeof item == 'object' )
	{

		for( var key in item ) 
		{
			if( item.hasOwnProperty( key ))
			{
				if( key == 'parent' )
				{
					delete item[ key ];
				}
				else
				{
					this.removeParentPointers( item[ key ]);
				}
			}
		}
	}
}
module.exports = exports = ImapMailboxListProducer;
