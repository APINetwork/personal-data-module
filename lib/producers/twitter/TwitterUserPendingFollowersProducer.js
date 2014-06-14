var base = require( '../ProducerBase.js' );
var twitter = require('mtwitter');

function TwitterUserPendingFollowersProducer( fetcher ) {
  this.fetcher = fetcher;
  base.init( this );
}

base.inherit(TwitterUserPendingFollowersProducer);

TwitterUserPendingFollowersProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:twitter:[0-9]+', '/relationship/incoming/pending' ];
}

TwitterUserPendingFollowersProducer.prototype.init = function( done ) {
  done();
}

TwitterUserPendingFollowersProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source,
                                                                  resource, keys, callback ) {

  var self = this;
  var userId = owner;

  tokenStore.getUserTokens( owner, source, function( error, tokens ) {
    var twit = new twitter({
      consumer_key: tokens.consumerKey ,
      consumer_secret: tokens.consumerSecret,
      access_token_key: tokens.token,
      access_token_secret: tokens.tokenSecret
    });

    twit.get('/friendships/incoming', {},
      function ( err, data ) {
        console.log( uri );
        console.log( data );
        if (err) {
          callback( err );
        } else {
          callback(null, {
            'uri': uri,
            'data': data
          });
        }
      }
    );
  });

}
module.exports = exports = TwitterUserPendingFollowersProducer;
