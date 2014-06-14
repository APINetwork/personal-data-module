var base = require( '../ProducerBase.js' );
var OAuth2 = require("oauth").OAuth2;

function FacebookUserPhotosProducer(fetcher) {
  this.fetcher = fetcher;
  base.init(this);
}

base.inherit(FacebookUserPhotosProducer);

FacebookUserPhotosProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '/fphotos' ];
}

FacebookUserPhotosProducer.prototype.init = function(done) {
  done();
}


FacebookUserPhotosProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source, resource, keys, callback ) {
  this.fetcher.tokenStore.getUserTokens(owner, source, function(error, data) {
    this.oauth2 = new OAuth2( data.clientID,  data.accessToken, null, /*Don't need the callback URL at this point)*/
        '/oauth/authenticate','/oauth/access_token');
    var facebookUrl = 'https://graph.facebook.com/me/photos?access_token='+  data.accessToken;
    this.oauth2.get(facebookUrl, data.accessToken , function(error, data) {
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

module.exports = exports = FacebookUserPhotosProducer;