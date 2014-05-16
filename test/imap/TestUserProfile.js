process.env.NODE_ENV = 'test';
var EDM = require( 'engine-data-module' );
var fs = require('fs');
var userData = fs.readFileSync('test/imap/TestUserData.txt').toString().split("\n");
var tokenStore = new EDM.DummyTokenStore();
var assert = require('assert');
var datamodule = new EDM.DataModule({
  tokenStore: tokenStore,
	services: [ 'imap' ]
});

describe('Testing Imap User Profile', function() {

  before(function() {
    tokenStore.storeUserTokens(
      'curtis', 'acct:imap:curtislacy221@yahoo.com@imap.mail.yahoo.com',
	    {
		     username: userData[0],
		     password: userData[1],
		     host: userData[2],
		     port: userData[3],
		     secure: userData[4]
	    }, function(){});
  });

  it('should return users imap profile', function() {
    datamodule.fetcher.fetch(
      'ldengine://curtis//@acct:imap:curtislacy221@yahoo.com@imap.mail.yahoo.com/user/curtis.lacy',
       function(error, result) {
         console.log("This is it");
         assert.equal(error, null);
       });
  });

});
