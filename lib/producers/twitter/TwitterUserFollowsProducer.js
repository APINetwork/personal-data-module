var base = require( '../ProducerBase.js' );
var twitter = require('mtwitter');

function TwitterUserFollowsProducer( fetcher ) {
  this.fetcher = fetcher;
  base.init( this );
}

base.inherit(TwitterUserFollowsProducer);

TwitterUserFollowsProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:twitter:[0-9]+', '/relationship/outgoing/confirmed' ];
}

TwitterUserFollowsProducer.prototype.init = function( done ) {
  done();
}

TwitterUserFollowsProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source,
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

    twit.get('/friends/list', { include_entities: true },
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
module.exports = exports = TwitterUserFollowsProducer;
