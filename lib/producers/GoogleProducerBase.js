var OAuth2 = require( 'oauth' ).OAuth2;

exports.inherit = function( subclass ) {
	subclass.prototype.attemptRequest = function( tokenStore, uri, owner, source, resource, keys, callback ) {
		console.log( 'Google Producer Base: ' + uri );

		var self = this;

		tokenStore.getUserTokens( owner, source, function( error, data ) {
			try {

				console.log( 'A' );
				
				var oauth2 = new OAuth2( 
					data.clientID, 
					data.accessToken,
					'https://accounts.google.com', 
					'/o/oauth2/auth', 
					'/o/oauth2/token' );

				var timesRefreshed = 0;
				var url = self.getDataUrl( resource );
				var needsTokenRefresh = function( error ) {
					console.log( 'B' );
					if( error.statusCode )
						if( error.statusCode == 401 || error.statusCode == 400 || error.statusCode == 404 )
							return true;

					return false;
				};
				var retryRequest = function( error, data, response ) {
					console.log( 'C:' );
					console.log( error );
					if( error )
					{
						console.log( 'D' );
						if( needsTokenRefresh( error ))
						{
							console.log( 'E, refresh token: ' + keys.refreshToken );
							oauth2.getOAuthAccessToken( 
								keys.refreshToken,
								{ 'grant_type': 'refresh_token' },
								function( error, accessToken, refreshToken, results ) {
									console.log( '** Completed Refresh: ' + accessToken );
									keys.accessToken = accessToken;
									tokenStore.storeUserTokens( 
										owner, source, keys, function( error ) {
											if( error )
											{
												error.originalUrl = url;
												callback( error, null );
											}
											else
												oauth2.get( url, keys.accessToken, 
													function( error, result ) {
														if( error )
														{
															error.originalUrl = url;
															if(error.statusCode == 401 ) {
																error = 'Login/Authentication failure for ' + uri +
																	' at attempt of url ' + url; 
															}
															callback( error, null );
														}
											            else
															self.processData( uri, owner, source, resource, result, callback );
													} );
										});
								});
						}
						else
						{
							console.log( 'F' );
							var error = new Error( 'Could not create Google connection, no password, accessToken, or refresh token was available.' );
							error.owner = owner;
							error.account = source;
							if(error.statusCode == 401) {
								error = 'Login/Authentication failure for ' + uri + ' at attempt of url ' + url; 
							}
							callback( error, null );
						}
					}
					else
					{
						console.log( 'G' );
						self.processData( uri, owner, source, resource, data, callback );
					}
				};
				console.log( 'H' );
				oauth2.get( url, keys.accessToken, retryRequest );
			} catch( e ) {
				console.trace( e );
			}

		});
	};
};
