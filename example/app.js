// We're using https://github.com/caolan/async for flow control later on.
// It's a nice package.
var async = require( 'async' );
var connect = require('express');
var app = connect();

app.use(connect.static('public'));
app.listen(process.env.PORT || 5000);
// Include the personal-data-module library.
var EDM = require( 'personal-data-module' );
// In a real application, you'd probably want to store the tokens in a database,
// but in this sample we'll use a simple in-memory datastore.
var tokenStore = new EDM.DummyTokenStore();
//inmemory store
var dataStore = {tweetsGraffiti : null};
//setting up routes
app.get('/data', function(req,res) {
    res.send(dataStore.tweetsGraffiti);
});
// The DummyTokenStore requires us to load it with the tokens we got when we registered
// our app with Twitter.
tokenStore.storeApplicationTokens(
    'twitter',
    {
        "consumerKey": "xxxxxxxxxxxxxxxxxxxxx",
        "consumerSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    function() {
      // Then we can actually instantiate the module.
        var datamodule = new EDM.DataModule( 
            { 
                tokenStore: tokenStore,
                // Specify which data sources we intend to use.  Anything listed in here
                // that doesn't have keys in the tokenStore will throw an error when it tries
                //to initialize.
                services: [ 'twitter' ]
            }
        );

    // The DummyTokenStore needs to be populated with user access tokens as well.
    // These would generally also be stored in a database in a real product.  You 
    // can use pretty much any string you want as a username.
        tokenStore.storeUserTokens( 
            'tweetsgraffiti', 'acct:twitter:2210018156',
            { 
        // personal-data-module doesn't provide any of the authentication flow, you'll
        // need to provde that.  https://github.com/jaredhanson/passport is an excellent
        // choice when it comes to authenticating with remote services.
              token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            tokenSecret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
          },
          function() {

    // Now that we have everything set up, we can actually runa few sample queries.
    // We're using async.series here to run the samples in series without having to 
    // Deeply indent and make things hard to read.
                async.series( 
                    [
                        /*function( done ) {
                // For "tweetsgraffiti"'s twitter account, recover his user profile.
                            datamodule.fetcher.fetch( 
                                'apinetwork://tweetsgraffiti//@acct:twitter:2210018156/user/2210018156',
                                function( error, result ) {
                                    if( error )
                                    {
                                        done( error );
                                    }
                                    else
                                    {
                                        console.log( '******************************************' );
                                        console.log( 'Twitter User Profile:')
                                        console.log( result );
                                        console.log( '******************************************' );
                                        done();
                                    }
                                }
                            );          
                        },*/
                        function( done ) {
                        // Now let's recover his most recent mentions.
                            setInterval(function() {

						 			  datamodule.fetcher.fetch( 
                                'apinetwork://tweetsgraffiti//@acct:twitter:2210018156/status/mentions',
                                function( error, result ) {
                                    if( error )
                                    {
                                        done( error );
                                    }
                                    else
                                    {
                                        console.log( '******************************************' );
                                        console.log( 'Twitter Mentions of that user:')
                                        dataStore.tweetsGraffiti = result;
													 console.log( result );
                                        console.log( '******************************************' );
                                        done();
                                    }
                                }
                            );
									 },300000);
                        }/*,
                        function( done ) {
                        // Recovering a user profile also works for a user other than the account owner.
                            datamodule.fetcher.fetch( 
                                'apinetwork://tweetsgraffiti//@acct:twitter:2210018156/user/90542269',
                                function( error, result ) {
                                    if( error )
                                    {
                                        done( error );
                                    }
                                    else
                                    {
                                        console.log( '******************************************' );
                                        console.log( 'Twitter User Profile for a user other than the account holder:')
                                        console.log( result );
                                        console.log( '******************************************' );
                                        done();
                                    }
                                }
                            );          
                        }*/
                    ],
                    function( error ) {
                        if( error )
                            console.log(error);
                    }
                );          
            }
        );
    }
);

