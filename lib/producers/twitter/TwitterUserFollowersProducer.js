var base = require( '../ProducerBase.js' );
var twitter = require('mtwitter');

function TwitterUserFollowersProducer( fetcher ) {
  this.fetcher = fetcher;
  base.init( this );
}

base.inherit(TwitterUserFollowersProducer);

TwitterUserFollowersProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:twitter:[0-9]+', '/followers' ];
}

TwitterUserFollowersProducer.prototype.init = function( done ) {
  done();
}

TwitterUserFollowersProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source,
                                          resource, keys, callback ) {
  var self = this;
  var userId = owner;

  tokenStore.getUserTokens( owner, source, function( error, tokens ) {
    var twit = new twitter({
      consumer_key: self.consumerKey ,
      consumer_secret: self.consumerSecret,
      access_token_key: tokens.token,
      access_token_secret: tokens.tokenSecret
    });

    twit.get('/followers/list.json', { include_entities: true },
          function (err, data) {
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
module.exports = exports = TwitterUserFollowersProducer;
