var moment = require( 'moment' ),
    async = require( 'async' );

function FacebookUserLikesTranslator() {
}

FacebookUserLikesTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '.*/flikes' ];
}


FacebookUserLikesTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var translatedLikes = new Array(),
      outputData = {},
      parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    likesData = JSON.parse( rawDoc.data ).data;
  } catch( err) {
    SystemLog.log('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(  err , null );
  }
  var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
  var source = parsedUri[3];
  async.forEachSeries(likesData, function(like, callback_s1) {
    // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
    // spec (opensocial-social-data-specification-2-5-0-draft):
    // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
    try {
      var translatedLike = self.translateLike(owner, source, like);
      outputData = {
        'sourceUri': sourceUri,
        'uri': 'ldengine://' + owner + '//@' + source + '/fnews/' + like.id,
        'owner': owner,
        'category': 'like',
        'data': translatedLike,
        'time': moment(translatedLike.created_time).valueOf()
      };
      translatedLikes.push(outputData);
      callback_s1();
    } catch(error) {
      callback_s1(error);
    }
  }, function () {
    callback(null, {
      'uri': sourceUri,
      'data': translatedLikes
    });
  });
};

FacebookUserLikesTranslator.prototype.translateLike = function( owner, source, rawLike ) {
  console.log(" rawLike :" +JSON.stringify(rawLike));
  var result = {
    'category': rawLike.category,
    'name': (rawLike.name || null),
    'category_list': (rawLike.category_list || null),
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png'
    },
    'id': 'ldengine://' + owner + '//@' + source + '/flikes/' + rawLike.id,
    'created_time': moment(rawLike.created_time).valueOf(),
    'itemtype': 'FacebookLike'
  };
  return result;
};
module.exports = exports = FacebookUserLikesTranslator;