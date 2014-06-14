var ImapConnection = require( 'imap' ).ImapConnection;
//var OAuth2 = require( 'oauth' ).OAuth2;
var Async = require( 'async' );
var utils = require( 'imap/lib/imap.utilities' );
var _ = require( 'underscore' );

function ImapService( fetcher ) {
	this.fetcher = fetcher;
}

ImapService.prototype._connect = function( owner, keys, callback ) {
	var self = this;

	// Open a connection.  
	if( keys.password )
	{
		var connection = new ImapConnection( keys );
		connection.connect( function( error ) {
			callback( error, connection );
		});
	}
	else // We must be doing oauth.
	{
		function refresh( done ) {
			self._refreshToken( owner, keys, function( error, newKeys ) {
				if( error )
					done( error );
				else
				{
					fetcher.storeUserKeys( owner, newKeys );
					console.log( 'Stored refreshed keys for: ' + owner );
					done( null, newKeys );
				}
			});
		};

		function connect( done ) {
			var encodedAccountInfo = self._encodeAccountInfo( keys );
			var connection = new ImapConnection( encodedAccountInfo );
			connection.connect( function( error ) {
				done( error, connection );
			});
		};

		if( keys.accessToken )
		{
			// Try to connect.
			connect( function( error, connection ) {
				if( error )
				{
			// If auth fails, refresh and try to connect.
					if( self._isAuthFailure( error ) && keys.refreshToken )
					{
						refresh( function( error ) {

							if( error )
								callback( error );
							else
								connect( function( error ) {
									callback( error, connection );
								});
						});
					}
					else
					{
						callback( error );
					}
				}
				else
				{
					callback( null, connection );
				}
			});
		}
	}
}

ImapService.prototype._encodeXOAuth2 = function( username, accessToken ) {
	var clientResponse = 'user=' + username + '\u0001auth=Bearer ' + accessToken + '\u0001\u0001';
	return utils.escape( new Buffer( clientResponse ).toString('base64') );
}

ImapService.prototype._encodeAccountInfo = function( account ) {
	var encodedAccountInfo = {
		username: account.username,
		host: account.host,
		port: account.port,
		secure: account.secure,
		profileURI: account.profileURI
	};
	if( account.password ) {
		encodedAccountInfo.password = account.password;
	}
	if( account.accessToken ) {
		encodedAccountInfo.xoauth2 = this._encodeXOAuth2( account.username, account.accessToken );
		encodedAccountInfo.accessToken = account.accessToken;
  }
  if( account.refreshToken ) {
		encodedAccountInfo.refreshToken = account.refreshToken;
	}

	return encodedAccountInfo;
}

ImapService.prototype._refreshToken = function( owner, account, done ) {
	var assembledKey = owner + '//@' + account;
	this.recentRefreshTimes[ assembledKey ] = new Date().getTime();
	
	var oauth2 = new OAuth2( 
		engine.config.gmail.clientID, 
		engine.config.gmail.clientSecret,
		'https://accounts.google.com', '/o/oauth2/auth', '/o/oauth2/token' );

	var parsedUri = account.profileURI.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
	var accountName = parsedUri[3];

	oauth2.getOAuthAccessToken( 
		account.refreshToken,
		{ 'grant_type': 'refresh_token' },
		function( error, accessToken, refreshToken, results ) {
			if( error )
			{
				// Don't need to log the error here since this is an internal method and we're passing it up.
				done( error );
			}
			else
			{
				console.log( 'Refreshed access token without error'/*!  refreshToken was: ' + account.refreshToken + ', clientId: ' + engine.config.gmail.clientID + ', clientSecret: ' + engine.config.gmail.clientSecret*/ + ', new accessToken: ' + accessToken );
				account.accessToken = accessToken;
				done( null, account );
			}

		}
	);
}

ImapService.prototype._isAuthFailure = function( error ) {
	if( error.status == 400 ||
		error.statusCode == 400 ||
		error.statusCode == 403 ||
		error.toString().indexOf( 'Invalid credentials' ) == 7 ||
		error.code == 'AUTHENTICATIONFAILED' )
	{
		return true;
	}
	else
	{
		return false;
	}
}

ImapService.prototype.getMailboxes = function( owner, account, callback ) {
	var self = this;

	function connectAndGetMailboxList( done ) {
		try 
		{
			// Connect.
			self._connect( owner, account, function( error, connection ) {
				if( error )
				{
					console.log( error );
					done( error );
				}
				else
				{
					try
					{
						self._getMailboxes( owner, connection, done );
					}
					catch( error )
					{
						console.log( error );
						done( error );
					}
				}
			});
			// Get the list of mailboxes.
		}
		catch( error )
		{
			console.log( error );
			done( error );
		}
	}

	// Get the list of mailboxes.
	connectAndGetMailboxList( function( error, result ) {

		if( error )
		{
		// If there's a failure getting the list of mailboxes, create a new connection and try again.
			connectAndGetMailboxList( callback );
		}
		else
		{
			callback( null, result );
		}
	});
}

ImapService.prototype.fetch = function( owner, account, mailbox, messageId, callback ) {
	this._fetchAndProcess( owner, account, mailbox, messageId, false, callback );
}
ImapService.prototype.fetchBySeqNo = function( owner, account, mailbox, messageId, callback ) {
	this._fetchAndProcess( owner, account, mailbox, messageId, true, callback );
}

ImapService.prototype._fetchAndProcess = function( owner, account, mailbox, messageId, useSeqNo, callback ) {
	var messages = [];
	this._fetch( 
		owner, account, mailbox, messageId, useSeqNo, 
		{
			'headers': { parse: false },
			body: true,
			cb: function( fetch ) {
				var data = {
					'chunks': new Array()
				};
				fetch.on('message', function(msg) {

					msg.on('data', function(chunk) {
						data.chunks.push( chunk.toString() );
					});
					
					msg.on('end', function() {
						data.id = msg.id;
						data.date = msg.date;
						data.flags = msg.flags;
						data.structure = msg.structure;
						data[ 'x-gm-thrid' ] = msg[ 'x-gm-thrid' ];
						data[ 'x-gm-msgid' ] = msg[ 'x-gm-msgid' ];
						data[ 'x-gm-labels'] = msg[ 'x-gm-labels' ];
						if( msg.headers )
							data.headers = msg.headers;
					});
		            msg.on('end', function() {
		            	messages.push( data );
					});
				});
				fetch.on( 'timeout', function() {
					timedout = true;
					callback( new Error( 'Search for message timed out' ), null );
				});
			}
		},
		function( error ) {
			callback( error, messages );
		});
}

ImapService.prototype._fetch = function( owner, account, mailbox, messageId, useSeq, options, callback ) {
	var self = this;

	function connectAndFetch( done ) {
		try 
		{
			// Connect.
			self._connect( owner, account, function( error, connection ) {
				if( error )
					done( error );
				else
				{
					try
					{
						connection.openBox( mailbox, true, function( error ) {
							if( error )
							{
								done( error );
							}
							else
							{
								try {	
									( useSeq ? connection.seq : connection ).fetch( 
										messageId, 
										options, 
										function( error ) {
											if( error )
											{
												done( error );
											}
											else
											{
												connection.closeBox( function( error ) {
													done( error );
												});
											}
										}
									);	
								} catch( error ) {
									if( error.message != 'Nothing to fetch' )
									{
										self._disposeOfDeadConnection( owner, account, connection );
										SystemLog.log( 'Error performing IMAP fetch', error );										
										callback( null );
									}
									else
									{
										// TODO: Release the connection back to the pool.
										connection.closeBox( function( error ) {
											callback( error );
										});										
									}
								}
							}
						} );
					}
					catch( error )
					{
						done( error );
					}
				}
			});
			// Get the list of mailboxes.
		}
		catch( error )
		{
			done( error );
		}
	}

	// Get the list of mailboxes.
	connectAndFetch( function( error, result ) {

		if( error )
		{
		// If there's a failure getting the list of mailboxes, create a new connection and try again.
			connectAndFetch( callback );
		}
		else
		{
			callback( null, result );
		}
	});	
}

ImapService.prototype._search = function( owner, account, mailbox, query, options, callback ) {
	var self = this;

	function connectAndSearch( done ) {
		try 
		{
			// Connect.
			self._connect( owner, account, function( error, connection ) {
				if( error )
					done( error );
				else
				{
					try
					{
						connection.openBox( mailbox, true, function( error ) {
							if( error )
							{
								done( error );
							}
							else
							{
								connection.search( query, 
									function( error, messageIds ) {
										if( error )
										{
											done( error );
										}
										else
										{
											try {									
												connection.fetch( messageIds, options, 
													function( error ) {
														if( error )
														{
															done( error );
														}
														else
														{
															connection.closeBox( function( error ) {
																done( error );
															});
														}
													}
												);	
											} catch( error ) {
												if( error.message != 'Nothing to fetch' )
												{
													self._disposeOfDeadConnection( owner, account, connection );
													SystemLog.log( 'Error performing IMAP fetch', error );										
													callback( null );
												}
												else
												{
													// TODO: Release the connection back to the pool.
													connection.closeBox( function( error ) {
														callback( error );
													});										
												}
											}
										}
									}
								);
							}
						} );
					}
					catch( error )
					{
						done( error );
					}
				}
			});
			// Get the list of mailboxes.
		}
		catch( error )
		{
			done( error );
		}
	}

	// Get the list of mailboxes.
	connectAndSearch( function( error, result ) {

		if( error )
		{
		// If there's a failure getting the list of mailboxes, create a new connection and try again.
			connectAndSearch( callback );
		}
		else
		{
			callback( null, result );
		}
	});
}

ImapService.prototype.searchForIDs = function( owner, account, mailbox, query, callback ) {
	var messageIdSets = [];

	this._search( 
		owner, account, mailbox, query, 
		{
			headers: 'message-id',
			cb: function( fetch ) {
				fetch.on('message', function(msg) {
					var headers;
		            msg.on('headers', function(hdrs) {
		            	headers = hdrs;
		            });
		            msg.on('end', function() {
		            	var ids = {
		            		'message-id': headers[ 'message-id' ],
		            		'x-gm-msgid': msg[ 'x-gm-msgid' ],
		            		uid: msg.uid,
		            		seqno: msg.seqno
		            	};
		            	messageIdSets.push( ids );
		            });
		          });
			}
		},
		function( error ) {
			callback( error, messageIdSets );
		});
}

ImapService.prototype.searchForMessages = function( owner, account, mailbox, query, callback ) {
	var messages = [];
	this._search( 
		owner, account, mailbox, query, 
		{
			'headers': { parse: false },
			body: true,
			cb: function( fetch ) {
				var data = {
					'chunks': new Array()
				};
				fetch.on('message', function(msg) {

					msg.on('data', function(chunk) {
						data.chunks.push( chunk.toString() );
					});
					
					msg.on('end', function() {
						data.id = msg.id;
						data.date = msg.date;
						data.flags = msg.flags;
						data.structure = msg.structure;
						data[ 'x-gm-thrid' ] = msg[ 'x-gm-thrid' ];
						data[ 'x-gm-msgid' ] = msg[ 'x-gm-msgid' ];
						data[ 'x-gm-labels'] = msg[ 'x-gm-labels' ];
						if( msg.headers )
							data.headers = msg.headers;
					});
		            msg.on('end', function() {
		            	messages.push( data );
					});
				});
				fetch.on( 'timeout', function() {
					timedout = true;
					callback( new Error( 'Search for message timed out' ), null );
				});
			}
		},
		function( error ) {
			callback( error, messages );
		});

}

ImapService.prototype._getMailboxes = function( owner, connection, callback ) {
	var self = this;

	var namespaceList = new Array();

	for( var i in connection.namespaces.personal )
		namespaceList.push( connection.namespaces.personal[ i ] );
	for( var i in connection.namespaces.other )
		namespaceList.push( connection.namespaces.other[ i ] );
	for( var i in connection.namespaces.shared )
		namespaceList.push( connection.namespaces.shared[ i ] );

	var results = new Array();


	Async.eachSeries( 
		namespaceList, 
		function( ns, callback ) {
			var prefixes;
			if( _.isArray( ns.prefix ))
				prefixes = ns.prefix;
			else
				prefixes = [ ns.prefix ];

			Async.eachSeries( 
				prefixes, 
				function( prefix, done ) {
					self._getMailboxesForPrefix( owner, connection, prefix, ns.delim, 
						function( error, result ) {
							if( error )
								done( error );
							else
							{
								results.push( result );
								done( null );
							}
						}
					);
				},
				function( error ) {
					callback( error );		
				}
			);
		}, 
		function( err ) {
			if( err )
			{
				callback( err, null );
			}
			else
			{
				if( results.length == 0 )
					SystemLog.error( 'No mailboxes recovered for owner: ' + owner + ' connection: ' + require( 'util' ).inspect( connection ));
				callback( null, results );
			}
		}
	);
}

ImapService.prototype._getMailboxesForPrefix = function( owner, connection, prefix, delim, callback ) {
	var self = this;

	var deadListener = function() {
		connection.deadListener = null;
		callback( new Error( 'Connection was killed' ), null );
	}
	connection.deadListener = deadListener;
	connection.getBoxes( prefix, function( error, boxes ) {
		connection.deadListener = null;
		if( error )
		{
			callback( error, null );
		}
		else
		{
			self._removeParentPointers( boxes );
			callback( null, 
				{
					'prefix': prefix,
					'delim': delim,
					'boxes': boxes
				} 
			);

		}
	});
}

ImapService.prototype._removeParentPointers = function( item ) {
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
					this._removeParentPointers( item[ key ]);
				}
			}
		}
	}
}

module.exports = exports = new ImapService();
