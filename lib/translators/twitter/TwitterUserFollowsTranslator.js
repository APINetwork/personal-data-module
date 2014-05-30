var Moment = require( 'moment' ),
    async = require( 'async' );

function TwitterUserFollowsTranslator() {
}
TwitterUserFollowsTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:twitter:[0-9]+', '/follows' ];
};
TwitterUserFollowsTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
  var translatedFollowers = new Array(),
      parseAccountId = uri.match( /acct:twitter:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    var followersData = rawDoc.data;
    var parsedUri = uri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
    var source = parsedUri[3];
    async.forEachSeries(followersData.users, function(follower, callback_s1) {
      var translatedFollower = self.translateFollower(owner, source, follower);
      var outputData = {
        'sourceUri': uri,
        'uri': 'ldengine://' + owner + '//@' + source + '/follow/' + follower.id,
        'owner': owner,
        'category': 'follower',
        'data': translatedFollower,
        'time': Moment(translatedFollower.created_at).valueOf()
      };
      console.log("TwitterUserFollowersTranslator :  outputData:" + JSON.stringify(outputData));
      translatedFollowers.push(outputData);
      callback_s1();
    }, function () {
      console.log("TwitterUserFollowersTranslator :  translatedFollowers:" + JSON.stringify(translatedFollowers));
      callback(null, {
        'uri': uri,
        'data': translatedFollowers
      });
    });
  } catch(err) {
    //SystemLog.error('TwitterUserFollowersTranslator: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(err , null);
  }
};

TwitterUserFollowsTranslator.prototype.translateFollower = function(owner, source, rawFollower) {
  console.log("TwitterUserFollowersTranslator: translate : "+ JSON.stringify(rawFollower));
  var result = {
    'id' : rawFollower.id,
    'name': rawFollower.name,
    'screen_name' :rawFollower.screen_name,
    'location' :rawFollower.location,
    'description' :rawFollower.description,
    'url' :rawFollower.url,
    'entities' :rawFollower.entities,
    'protected' :rawFollower.protected,
    'followers_count' :rawFollower.followers_count,
    'friends_count' :rawFollower.friends_count,
    'listed_count' :rawFollower.listed_count,
    'created_at' :rawFollower.created_at,
    'utc_offset' :rawFollower.utc_offset,
    'profile_background_color' :rawFollower.profile_background_color,
    'profile_background_image_url' :rawFollower.profile_background_image_url,
    'profile_background_image_url_https' :rawFollower.profile_background_image_url_https,
    'profile_background_tile' :rawFollower.profile_background_tile,
    'profile_image_url' :rawFollower.profile_image_url,
    'profile_link_color' :rawFollower.profile_link_color,
    'following' :rawFollower.following,
    'notifications' :rawFollower.notifications,
    'muting' :rawFollower.muting,
    'follow_request_sent' :rawFollower.follow_request_sent
  };
  return result;
};
module.exports = exports = TwitterUserFollowsTranslator;