var moment = require( 'moment' ),
    async = require( 'async' );

function FacebookUserVideosTranslator() {
}

FacebookUserVideosTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '.*/fvideos' ];
}

FacebookUserVideosTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var translatedVideos = new Array(),
      outputData = {},
      parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    videosData = JSON.parse(rawDoc.data).data;
  } catch( err) {
    SystemLog.log('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(  err , null );
  }
  var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
  var source = parsedUri[3];
  async.forEachSeries(videosData, function(video, callback_s1) {
    // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
    // spec (opensocial-social-data-specification-2-5-0-draft):
    // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
    try {
      var translatedVideo = self.translateVideo(owner, source, video);
      outputData = {
        'sourceUri': sourceUri,
        'uri': 'ldengine://' + owner + '//@' + source + '/fvideo/' + video.id,
        'owner': owner,
        'category': 'video',
        'data': translatedVideo,
        'time': moment(translatedVideo.created_time).valueOf()
      };
      translatedVideos.push(outputData);
      callback_s1();
    } catch(error) {
      callback_s1(error);
    }
  }, function () {
    callback(null, {
      'uri': sourceUri,
      'data': translatedVideos
    });
  });
};

FacebookUserVideosTranslator.prototype.translateVideo = function(owner, source, rawVideo) {
  var result = {
    'from': (rawVideo.from || null),
    'name': (rawVideo.name || null),
    'icon': (rawVideo.icon || null),
    'tags': (rawVideo.tags || null),
    'embed_html': (rawVideo.embed_html || null),
    'picture': (rawVideo.picture || null),
    'source': (rawVideo.source || null),
    'description': (rawVideo.description || null),
    'format': (rawVideo.format || null),
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png'
    },
    'id': 'ldengine://' + owner + '//@' + source + '/fvideos/' + rawVideo.id,
    'created_time': moment(rawVideo.created_time).valueOf(),
    'updated_time' : moment(rawVideo.updated_time).valueOf(),
    'itemtype': 'FacebookVideo'
  };
  return result;
};
module.exports = exports = FacebookUserVideosTranslator;