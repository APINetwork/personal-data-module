var base = require('../ProducerBase.js');
var OAuth2 = require("oauth").OAuth2;
var async = require('async');

function FacebookContactListProducer(fetcher) {
  this.fetcher = fetcher;
  base.init(this);
}

base.inherit(FacebookContactListProducer);

FacebookContactListProducer.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '/contacts'  ];
}
var self;
FacebookContactListProducer.prototype.init = function(done) {
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

FacebookContactListProducer.prototype.attemptRequest = function(uri, owner, source, resource, keys, callback) {

 var fields = 'bio,birthday,cover,currency,devices,education,email,favorite_athletes,favorite_teams,' +
     'first_name,gender,hometown,id,installed,interested_in,languages,last_name,link,locale,location,' +
     'middle_name,name,picture,political,quotes,relationship_status,religion,significant_other,third_party_id,' +
     'timezone,updated_time,username,verified,video_upload_limits,website,work';

 this.fetcher.tokenStore.getUserTokens(owner, source, function(error, data) {
   this.oauth2 = new OAuth2(self.clientID,  data.accessToken, self.callbackUrl,
           '/oauth/authenticate','/oauth/access_token');
   var facebookUrl = 'https://graph.facebook.com/me/friends?access_token='+  data.accessToken +'&fields='+fields.toString();
   var resultData = [];
   this.oauth2.get(facebookUrl, data.accessToken , function(error, firendsData) {
     if (error) {
       callback(error, null);
     } else {
       firendsData = JSON.parse(firendsData).data;
       async.forEachSeries(firendsData, function(friend, callback_s1) {
         var friendUrl = 'https://graph.facebook.com/'+friend.username+'?access_token='+data.accessToken +'&fields='+fields.toString();
         this.oauth2.get(friendUrl, data.accessToken , function(error, friendProfile) {
           if (error) {
             callback_s1(error);
           } else {
             resultData.push(friendProfile);
             callback_s1();
           }
         });
       }, function () {
         callback(null, {
           'uri': uri,
           'data': resultData
         });
       });
     }
   });
 });
};

module.exports = exports = FacebookContactListProducer;