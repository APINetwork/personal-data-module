var Moment = require( 'moment' ),
    async = require( 'async' );

function TwitterUserPendingFollowesTranslator() {
}
TwitterUserPendingFollowesTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:twitter:[0-9]+', '/pendingfollowes' ];
};
TwitterUserPendingFollowesTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
  var translatedPendingFollowes = new Array(),
      parseAccountId = uri.match( /acct:twitter:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    var pendingFollowersData = rawDoc.data;
    var parsedUri = uri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
    var source = parsedUri[3];
    if (pendingFollowersData.ids.length <= 0) {
      callback(null, {
        'uri': uri,
        'data': translatedPendingFollowes
      });
    } else {
      async.forEachSeries(pendingFollowersData.ids, function(pendingFollowes, callback_s1) {
        console.log("TwitterUserPendingFollowesTranslator :  outputData:" + JSON.stringify(pendingFollowes));
        translatedPendingFollowes.push(pendingFollowes.id_str);
        callback_s1();
      }, function () {
        console.log("TwitterUserPendingFollowesTranslator :  translatedFollowes:" + JSON.stringify(translatedPendingFollowes));
        callback(null, {
          'uri': uri,
          'data': translatedPendingFollowes
        });
      });
    }
  } catch(err) {
    //SystemLog.error('TwitterUserFollowersTranslator: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(err , null);
  }
};
module.exports = exports = TwitterUserPendingFollowesTranslator;