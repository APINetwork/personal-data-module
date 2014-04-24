var base = require('../ProducerBase.js');
var OAuth2 = require("oauth").OAuth2;

function FacebookUserProfileProducer(fetcher) {
  this.fetcher = fetcher;
  base.init(this);
}

base.inherit(FacebookUserProfileProducer);
FacebookUserProfileProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '/user/[0-9]+' ];
}

var self;
FacebookUserProfileProducer.prototype.init = function(done) {
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
};


FacebookUserProfileProducer.prototype.attemptRequest = function(uri, owner, source, resource, keys, callback) {
 var fields = 'bio,birthday,cover,currency,devices,education,email,favorite_athletes,favorite_teams,' +
     'first_name,gender,hometown,id,installed,interested_in,languages,last_name,link,locale,location,' +
     'middle_name,name,picture,political,quotes,relationship_status,religion,significant_other,third_party_id,' +
     'timezone,updated_time,username,verified,video_upload_limits,website,work';
 this.fetcher.tokenStore.getUserTokens(owner, source, function(error, data) {
   this.oauth2 = new OAuth2(self.clientID,  data.accessToken, self.callbackUrl,
           '/oauth/authenticate','/oauth/access_token');
   var facebookUrl = 'https://graph.facebook.com/me?access_token='+  data.accessToken +'&fields='+fields.toString();
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

module.exports = exports = FacebookUserProfileProducer;
