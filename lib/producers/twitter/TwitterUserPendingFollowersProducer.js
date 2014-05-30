var base = require( '../ProducerBase.js' );
var twitter = require('mtwitter');

function TwitterUserPendingFollowersProducer( fetcher ) {
  this.fetcher = fetcher;
  base.init( this );
}

base.inherit(TwitterUserPendingFollowersProducer);

TwitterUserPendingFollowersProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:twitter:[0-9]+', '/pendingfollowers' ];
}

TwitterUserPendingFollowersProducer.prototype.init = function( done ) {
  console.log("TwitterUserPendingFollowersProducer ::");
  var self = this;
  this.fetcher.tokenStore.getApplicationTokens( 'twitter', function(error, tokens) {
    self.consumerKey = tokens.consumerKey;
    self.consumerSecret = tokens.consumerSecret;
    if( error ) {
      done( error );
    }
    else
    {
      var OAuth = require('oauth').OAuth;
      self.oauth = new OAuth(
          "https://api.twitter.com/oauth/request_token",
          "https://api.twitter.com/oauth/authorize",
          tokens.consumerKey,
          tokens.consumerSecret,
          "1.0", null, "HMAC-SHA1" );
      done();
    }
  } );
}

TwitterUserPendingFollowersProducer.prototype.attemptRequest = function( uri, owner, source,
                                                                  resource, keys, callback ) {
  var self = this;
  var userId = owner;

  this.fetcher.tokenStore.getUserTokens( owner, source, function( error, tokens ) {
    var twit = new twitter({
      consumer_key: self.consumerKey ,
      consumer_secret: self.consumerSecret,
      access_token_key: tokens.token,
      access_token_secret: tokens.tokenSecret
    });

    twit.get('/friendships/incoming.json', { include_entities: true },
        function (err, data) {
          if (err) {
            console.log(err.toString());
          } else {
            console.log(JSON.stringify(data));
            callback(null, {
              'uri': uri,
              'data': data
            });
          }
        });
  });

}
module.exports = exports = TwitterUserPendingFollowersProducer;
