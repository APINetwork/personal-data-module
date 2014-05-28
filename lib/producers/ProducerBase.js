var Retry = require( '../RetryUtil' );
var async = require( 'async' );

exports.init = function( object ) {
	if( object.init )
	{
		object.init( function( error ) {
			if( error )
				throw error;
			else
				object._ready = true;
		});
	}
	else
	{
		object._ready = true;
	}
}

exports.inherit = function( subclass ) {
	subclass.prototype.produce = function( tokenStore, uri, owner, source, resource, callback ) {
		var self = this;

		async.until(
			function(){ return self._ready },
			function( done ){ setTimeout( done, 100 ); },
			function( error ) {
				tokenStore.getUserTokens( owner, source, function( error, keys ) {
					if( error )
					{
						self.attemptRequest( tokenStore, uri, owner, source, resource, keys, callback );
					}
					else
					{
						var retry = new Retry(
							function( callback ) { // Use the subclass method to actually make the query.
								try {
                  					self.attemptRequest( tokenStore, uri, owner, source, resource, keys, callback );
								} catch( error ) {
									callback( error );
								}
							},
							3, // Limit ourselves to three retries, in the "best" failure case.
							function( errorWeMightWaitBecauseOf ) { // If we get back a status code of 202, wait 250ms before trying again.
								if( errorWeMightWaitBecauseOf.statusCode == 202 )
									return 250;
								else
									return 0;
							},
							function( errorThatMightMakeUsGiveUp ) { // If we get a 400 series error, just give up.  This means we sent something that the remote server didn't like, and doing it again won't help.
								if( errorThatMightMakeUsGiveUp.statusCode >= 400 && errorThatMightMakeUsGiveUp.statusCode < 500 )
								{
									return true;
								}
								else
									return false;
							}
						);
						retry.query( function( error, result ) {
							callback( error, result );
						});

					}
				} );
			}
		);

	}
}
