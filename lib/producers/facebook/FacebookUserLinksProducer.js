var base = require( '../ProducerBase.js' );
var OAuth2 = require("oauth").OAuth2;


function FacebookUserLinksProducer(fetcher) {
  this.fetcher = fetcher;
  base.init(this);
}

base.inherit(FacebookUserLinksProducer);

FacebookUserLinksProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '/flinks' ];
}

var self;

FacebookUserLinksProducer.prototype.init = function(done) {
  self = this;
  this.fetcher.tokenStore.getApplicationTokens('facebook' , function(error, tokens) {
    if (error) {
      done(error, null);
    } else {
      self.clientID = tokens.clientId;
      self.clientSecret = tokens.clientSecret;
      self.callbackUrl = tokens.callbackUrl;
    }
    done();
  });
}


FacebookUserLinksProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
  this.fetcher.tokenStore.getUserTokens(owner, source, function(error, data) {
    this.oauth2 = new OAuth2(self.clientID,  data.accessToken, self.callbackUrl,
        '/oauth/authenticate','/oauth/access_token');
    var facebookUrl = 'https://graph.facebook.com/me/links?access_token='+  data.accessToken;
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

module.exports = exports = FacebookUserLinksProducer;