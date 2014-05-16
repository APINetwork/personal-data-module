function FacebookUserProfileTranslator() {
}

FacebookUserProfileTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '/user/[0-9]+' ];
}

FacebookUserProfileTranslator.prototype.translate = function(uri, owner, rawDoc, callback) {
  try {
    var userProfile = JSON.parse(rawDoc.data);
    var result = {
      'id': uri,
      'displayName': {'formatted' : userProfile.name },
      'preferredUsername' : userProfile.username,
      'thumbnailUrl' : userProfile.picture.data.url,
      'appData' : {
        'serviceName' : 'Facebook',
        'serviceImgUrl' : '/images/512x512-logos/facebook.png',
        'verified' : userProfile.verified
      },

      'location' : userProfile.locale,
      'aboutMe' : userProfile.birthday
                +','+userProfile.email
                +','+userProfile.gendar,
      'emails' : [userProfile.email],
      'urls' : [userProfile.link],
      'utcOffset' : userProfile.timezone,
      'languagesSpoken' : [userProfile.lang]
    };

    if (userProfile.status) {
      result.status = userProfile.status.text;
    }

    var outputData = {
      'uri' : uri,
      'owner' : owner,
      'category' : 'person',
      'data' : result
    };

    callback(null, outputData);
  } catch(err) {
    callback(err, null);
  }
};
module.exports = exports = FacebookUserProfileTranslator;