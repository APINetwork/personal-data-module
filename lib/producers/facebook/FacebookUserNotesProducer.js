var base = require( '../ProducerBase.js' );
var OAuth2 = require("oauth").OAuth2;


function FacebookUserNotesProducer(fetcher) {
  this.fetcher = fetcher;
  base.init(this);
}

base.inherit(FacebookUserNotesProducer);

FacebookUserNotesProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '/fnotes' ];
}

FacebookUserNotesProducer.prototype.init = function(done) {
  done();
}


FacebookUserNotesProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source, resource, keys, callback ) {
  tokenStore.getUserTokens(owner, source, function(error, data) {
    var oauth2 = new OAuth2(data.clientID,  data.accessToken, null, /* Don't need the callback at this point */
        '/oauth/authenticate','/oauth/access_token');
    var facebookUrl = 'https://graph.facebook.com/me/notes?access_token='+  data.accessToken;
    oauth2.get(facebookUrl, data.accessToken , function(error, data) {
      if (error) {
        callback(error, null);
      } else {
        callback( null, {
          'uri': uri,
          'data': data
        });
      }
    });
  });
};

module.exports = exports = FacebookUserNotesProducer;