var Moment = require( 'moment' ),
    async = require( 'async' );

function TwitterUserPendingFollowersTranslator() {
}
TwitterUserPendingFollowersTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:twitter:[0-9]+', '/relationship/incoming/pending' ];
};
TwitterUserPendingFollowersTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
  console.log( '*** TwitterUserPendingFollowersTranslator.translate!' );
  var translatedPendingFollowers = new Array(),
      parseAccountId = uri.match( /acct:twitter:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    var pendingFollowersData = rawDoc.data;
    console.log( rawDoc );
    var parsedUri = uri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
    var source = parsedUri[3];
    if ( pendingFollowersData.ids.length <= 0 ) {
      callback(null, {
        'uri': uri,
        'data': translatedPendingFollowers
      });
    } else {
      async.forEachSeries(pendingFollowersData.ids, function(pendingFollower, callback_s1) {
        console.log("TwitterUserPendingFollowersTranslator :  outputData:" + JSON.stringify(pendingFollower));
        translatedPendingFollowers.push(pendingFollower.id_str);
        callback_s1();
      }, function () {
        console.log("TwitterUserPendingFollowersTranslator :  translatedFollowers:" + JSON.stringify(translatedPendingFollowers));
        callback(null, {
          'uri': uri,
          'data': translatedPendingFollowers
        });
      });
    }
  } catch(err) {
    //SystemLog.error('TwitterUserFollowersTranslator: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(err , null);
  }
};
module.exports = exports = TwitterUserPendingFollowersTranslator;