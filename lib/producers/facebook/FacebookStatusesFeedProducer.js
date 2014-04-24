var base = require( '../ProducerBase.js' );
var OAuth2 = require("oauth").OAuth2;

function FacebookStatusesFeedProducer(fetcher) {
  this.fetcher = fetcher;
  base.init(this);
}

base.inherit(FacebookStatusesFeedProducer);

FacebookStatusesFeedProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '/fstatuses' ];
}

var self;

FacebookStatusesFeedProducer.prototype.init = function(done) {
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

FacebookStatusesFeedProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
  this.fetcher.tokenStore.getUserTokens(owner, source, function(error, data) {
    this.oauth2 = new OAuth2(self.clientID,  data.accessToken, self.callbackUrl,
        '/oauth/authenticate','/oauth/access_token');
    var facebookUrl = 'https://graph.facebook.com/me/feed?access_token='+  data.accessToken;
    this.oauth2.get(facebookUrl, data.accessToken , function(error, data) {
      if (error) {
        callback(error, null);
      } else {
        console.log("producer status feed "+ JSON.stringify(data));
        callback( null, {
          'uri': uri,
          'data': data
        });
      }
    });
  });
};

module.exports = exports = FacebookStatusesFeedProducer;