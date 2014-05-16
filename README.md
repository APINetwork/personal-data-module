Engine-Data-Module
==================

Access a variety of data sources in a simple, consistent way.

Usage
==================
Aside from authentication setup, there's essentially one call to recover data in the engine-data-module:

```js
	datamodule.fetcher.fetch( uri, callback );
```
where callback takes two arguments, an error and a result document.

How is this possible?  Every piece of data that can be recovered has a URI associated with it.  This URI contains the user identification information, as well as a reference to the data that we want to recover.  For example:
```
	ldengine://curtis//@acct:twitter:90542269/status/mentions
```
is the URI of a document which includes all of the a particular twitter account's mentions.  Also included in the URI is the user ID of the user in our local system, so that we can keep users' data separate from each other.  The URI format is according to the following:
```
	{protocol}://{Local User ID}//@{Remote Data Source}/{Path describing the desired document}
```
In the above example, {protocol} is "ldengine", indicating a standard engine-data-module data document URI.  {Local User ID} is "curtis", which is the user who created the example, and the key used to look up that user's access keys in the TokenStore.  {Remote Data Source} is "acct:twitter:90542269", which indicates an account from Twitter, belonging to user #90542269.  The path is "status/mentions", which is means we want user statuses which mention that user.

Sample URIs
==================
Within the URI format described above, there is some variation in the data which can be recovered from each data source.  The goal is to make these URIs as consistent as possible, so some revision is not unthinkable.  Here are samples of the URIs we have so far:

| Source  | URI                                                         | Meaning                   |
| ------- | ----------------------------------------------------------- | ------------------------- |
| App.net | ldengine://{owner}//@acct:appdotnet:{accountID}/user/{userID}  | User Profile for {userID} |
|         | ldengine://{owner}//@acct:appdotnet:{accountID}/user/following | List of users that {accountID} is following. |
|         | ldengine://{owner}//@acct:appdotnet:{accountID}/user/followers | List of users who follow {accountID}. |
|         | ldengine://{owner}//@acct:appdotnet:{accountID}/posts/mentions | List of posts mentioning {accountID}. |
|         | ldengine://{owner}//@acct:appdotnet:{accountID}/posts/created  | List of posts created by {accountID}. |
| Gmail   | ldengine://{owner}//@acct:gmail:{accountID}/user/{userID}      | User Profile for {userID} |
|         | ldengine://{owner}//@acct:gmail:{accountID}/mailbox/_index     | List of mailboxes in ownerID's account. |
|         | ldengine://{owner}//@acct:gmail:{accountID}/mailbox/{mailboxName} | List of messages in mailbox named {mailboxName}, by URI |
|         | ldengine://{owner}//@acct:gmail:{accountID}/message/x-gm-msgid/{messageID} | Email message by gmail message ID |
|         | ldengine://{owner}//@acct:gmail:{accountID}/message/{mailboxName}/message-id/{msgID} | Email message in given mailbox according to its "message-id" SMTP header |
|         | ldengine://{owner}//@acct:gmail:{accountID}/message/{mailboxName}/uid/{msgID} | Email message in given mailbox with server-assigned UID {msgID} |
|         | ldengine://{owner}//@acct:gmail:{accountID}/message/{mailboxName}/{seqNumber} | Email message in given mailbox according to its sequence number |
| IMAP    | ldengine://{owner}//@acct:imap:{username}@{server}/user/{username} | User profile for {username} (This data is very limited) |
|         | ldengine://{owner}//@acct:imap:{username}@{server}/mailbox/_index     | List of mailboxes in ownerID's account. |
|         | ldengine://{owner}//@acct:imap:{username}@{server}/mailbox/{mailboxName} | List of messages in mailbox named {mailboxName}, by URI |
|         | ldengine://{owner}//@acct:imap:{username}@{server}/message/{mailboxName}/uid/{msgID} | Email message in given mailbox with server-assigned UID {msgID} |
|         | ldengine://{owner}//@acct:imap:{username}@{server}/message/{mailboxName}/{seqNumber} | Email message in given mailbox according to its sequence number |
| Twitter | ldengine://{owner}//@acct:twitter:{accountID}/user/{userID}        | User Profile for {userID} |
|         | ldengine://{owner}//@acct:twitter:{accountID}/status/sent          | Status messages sent by {accountID} |
|         | ldengine://{owner}//@acct:twitter:{accountID}/{userID}/relationship/outgoing/confirmed | List of users that {userID} is following. |
|         | ldengine://{owner}//@acct:twitter:{accountID}/{userID}/relationship/outgoing/pending   | List of users that {userID} has requested to follow. |
|         | ldengine://{owner}//@acct:twitter:{accountID}/status/mentions      | Status messages that mention {accountID}. |
|         | ldengine://{owner}//@acct:twitter:{accountID}/{userID}/relationship/incoming/confirmed | List of users that follow {userID}. |
|         | ldengine://{owner}//@acct:twitter:{accountID}/{userID}/relationship/incoming/pending   | List of users that have requested to follow {userID} |
|         | ldengine://{owner}//@acct:twitter:{accountID}/direct/sent      | Direct messages sent by {accountID} |
|         | ldengine://{owner}//@acct:twitter:{accountID}/direct/received  | Direct messages received by {accountID} |
| Facebook| ldengine://{owner}//@acct:facebook:{accountID}/user/{userID}        | User Profile for {userID} |
|         | ldengine://{owner}//@acct:facebook:{accountID}/contacts             | User's friends profile list |
|         | ldengine://{owner}//@acct:facebook:{accountID}/fnews                | User's news feed |
|         | ldengine://{owner}//@acct:facebook:{accountID}/fstatuses            | User's status feed |
|         | ldengine://{owner}//@acct:facebook:{accountID}/fevents              | User's created events. |
|         | ldengine://{owner}//@acct:facebook:{accountID}/fgroups              | User's group details |
|         | ldengine://{owner}//@acct:facebook:{accountID}/flikes               | User's likes |
|         | ldengine://{owner}//@acct:facebook:{accountID}/flinks               | Links shared by user |
|         | ldengine://{owner}//@acct:facebook:{accountID}/fphotos              | User's photos |
|         | ldengine://{owner}//@acct:facebook:{accountID}/fposts               | Posts shared by user |
|         | ldengine://{owner}//@acct:facebook:{accountID}/falbums              | albums shared by user |
|         | ldengine://{owner}//@acct:facebook:{accountID}/fnotes               | User's notes |
|         | ldengine://{owner}//@acct:facebook:{accountID}/fvideos              | Videos shared by user |

Code Sample
==================

```js
// We're using https://github.com/caolan/async for flow control later on.
// It's a nice package.
var async = require( 'async' );

// Include the engine-data-module library.
var EDM = require( 'engine-data-module' );
// In a real application, you'd probably want to store the tokens in a database,
// but in this sample we'll use a simple in-memory datastore.
var tokenStore = new EDM.DummyTokenStore();

// The DummyTokenStore requires us to load it with the tokens we got when we registered
// our app with Twitter.
tokenStore.storeApplicationTokens(
	'twitter',
	{
		"consumerKey": "GetThisFromTwitter",
		"consumerSecret": "GetThisFromTwitterAsWellAndDontTellItToAnyone"
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
			'curtis', 'acct:twitter:90542269',
			{ 
		// engine-data-module doesn't provide any of the authentication flow, you'll
		// need to provde that.  https://github.com/jaredhanson/passport is an excellent
		// choice when it comes to authenticating with remote services.
			  token: 'YouGetThisTokenWhenAUserAuthenticatesWithTwitter',
		  	tokenSecret: 'YouAlsoGetThisTokenWhenTheUserAuthenticates'
		  },
		  function() {

    // Now that we have everything set up, we can actually runa few sample queries.
    // We're using async.series here to run the samples in series without having to 
    // Deeply indent and make things hard to read.
				async.series( 
					[
						function( done ) {
		        // For "curtis"'s twitter account, recover his user profile.
							datamodule.fetcher.fetch( 
								'ldengine://curtis//@acct:twitter:90542269/user/90542269',
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
						},
						function( done ) {
						// Now let's recover his most recent mentions.
							datamodule.fetcher.fetch( 
								'ldengine://curtis//@acct:twitter:90542269/status/mentions',
								function( error, result ) {
									if( error )
									{
										done( error );
									}
									else
									{
										console.log( '******************************************' );
										console.log( 'Twitter Mentions of that user:')
										console.log( result );
										console.log( '******************************************' );
										done();
									}
								}
							);			
						},
						function( done ) {
						// Recovering a user profile also works for a user other than the account owner.
							datamodule.fetcher.fetch( 
								'ldengine://curtis//@acct:twitter:90542269/user/130852105',
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
						}
					],
					function( error ) {
						if( error )
							throw error;
					}
				);  		
		  	}
		);
	}
);

```

MIT License
==================

Copyright 2012-2013 Engine, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
