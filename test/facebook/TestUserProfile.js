process.env.NODE_ENY = 'test';
process.env.FACEBOOK_KEY = '500475259980837';
process.env.FACEBOOK_SECRET = '1502a48345e37d6555167fd2c62ad83';
var EDM = require('engine-data-module');
var fs = require('fs');
var tokenStore = new EDM.DummyTokenStore();
var assert = require('assert');
var datamodule = new EDM.DataModule({
  tokenStore: tokenStore,
  services : ['facebook']
});

describe('Testing Facebook User Profile', function() {
  before(function(){
    tokenStore.storeApplicationTokens('facebook',
     {
       'clientID': 'WKNX6sfLc4GbJD0qeBomg',
       'clientSecret':'bQ8YOtdwNdqEPN6q92LnIE8MWgCnrgRf06NWTaN81IA',
       'callbackUrl' :'https://127.0.0.1:3000/facebooklogin/return',
       'accessToken' : 'CAACEdEose0cBAErwYtncZAqZA3TmN9ZBdAZAR8guJWoutX2f97bKNqwLrVuxaUddw7JWgnVGLQA80pet32yOUd7tSELf9OeU2ipDpwoptovO7LTBm43Qkmnml4J98mMBZCV4MZB0lTyoA0C8Y3mvwlYXlC3cDUBwZAooz3zzJY2V5smGIz6lIigRoKVKnQ0dzYPQerrJBzt2QZDZD'
     }, function() {
        tokenStore.storeUserTokens('yuho.jeta',
            'acct:facebook:100007891360262',
            {
              'accessToken' : 'CAACEdEose0cBAErwYtncZAqZA3TmN9ZBdAZAR8guJWoutX2f97bKNqwLrVuxaUddw7JWgnVGLQA80pet32yOUd7tSELf9OeU2ipDpwoptovO7LTBm43Qkmnml4J98mMBZCV4MZB0lTyoA0C8Y3mvwlYXlC3cDUBwZAooz3zzJY2V5smGIz6lIigRoKVKnQ0dzYPQerrJBzt2QZDZD'
            },
            function(){
              it('should return users facebook profile', function() {
                datamodule.fetcher.fetch('ldengine://yuho.jeta//@acct:facebook:100007891360262/user/100007891360262',
                    function(error, result) {
                      console.log("this is result "+result);
                      console.log("this is error "+ JSON.stringify(error));
                      //assert.equal(error, null);
                      assert.equal(result.username,'yuho.tata');
                    });
              });
            });
     });
  });
/*
  it('should return users facebook profile', function() {
    datamodule.fetcher.fetch('ldengine://yuho.jeta//@acct:facebook:100007891360262/user/100007891360262',
     function(error, result) {
       console.log("this is result "+result);
       console.log("this is error "+ JSON.stringify(error));
       //assert.equal(error, null);
       assert.equal(result.username,'yuho.tata');
     });
  });
*/
});
