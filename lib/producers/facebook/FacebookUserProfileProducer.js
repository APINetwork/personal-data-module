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

FacebookUserProfileProducer.prototype.init = function(done) {
  done();
};


FacebookUserProfileProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source, resource, keys, callback) {
 var fields = 'bio,birthday,cover,currency,devices,education,email,favorite_athletes,favorite_teams,' +
     'first_name,gender,hometown,id,installed,interested_in,languages,last_name,link,locale,location,' +
     'middle_name,name,picture,political,quotes,relationship_status,religion,significant_other,third_party_id,' +
     'timezone,updated_time,verified,video_upload_limits,website,work';
 tokenStore.getUserTokens(owner, source, function(error, data) {
   var oauth2 = new OAuth2( data.clientID,  data.accessToken, null, /*Don't need the callback URL at this point)*/
           '/oauth/authenticate','/oauth/access_token');
   var facebookUrl = 'https://graph.facebook.com/me?access_token='+  data.accessToken +'&fields='+fields.toString();
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

module.exports = exports = FacebookUserProfileProducer;
