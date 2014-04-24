var moment = require( 'moment' ),
    async = require( 'async' );

function FacebookUserPhotosTranslator() {
}

FacebookUserPhotosTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '.*/fphotos' ];
}


FacebookUserPhotosTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var translatedPhotos = new Array(),
      outputData = {},
      parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    photosData = JSON.parse( rawDoc.data ).data;
  } catch( err) {
    SystemLog.log('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(  err , null );
  }
  var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
  var source = parsedUri[3];
  async.forEachSeries(photosData, function(photo, callback_s1) {
    // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
    // spec (opensocial-social-data-specification-2-5-0-draft):
    // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
    try {
      var translatedPhoto = self.translatePhoto(owner, source, photo);
      outputData = {
        'sourceUri': sourceUri,
        'uri': 'ldengine://' + owner + '//@' + source + '/fphotos/' + photo.id,
        'owner': owner,
        'category': 'photo',
        'data': translatedPhoto,
        'time': moment(translatedPhoto.created_time).valueOf()
      };
      translatedPhotos.push(outputData);
      callback_s1();
    } catch(error) {
      callback_s1(error);
    }
  }, function () {
    callback(null, {
      'uri': sourceUri,
      'data': translatedPhotos
    });
  });
};


FacebookUserPhotosTranslator.prototype.translatePhoto = function( owner, source, rawPhoto ) {
  var result = {
    'picture': rawPhoto.picture,
    'source': (rawPhoto.source || null),
    'images': (rawPhoto.images || null),
    'height': (rawPhoto.height || null),
    'width': (rawPhoto.width || null),
    'link': (rawPhoto.link || null),
    'icon': (rawPhoto.icon || null),
    'tags': (rawPhoto.tags || null),
    'width': (rawPhoto.width || null),
    'icon': (rawPhoto.icon || null),
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png'
    },
    'id': 'ldengine://' + owner + '//@' + source + '/fphotos/' + rawPhoto.id,
    'created_time': moment(rawPhoto.created_time).valueOf(),
    'updated_time' : moment(rawPhoto.updated_time).valueOf(),
    'itemtype': 'FacebookPhoto'

  };
  return result;
};
module.exports = exports = FacebookUserPhotosTranslator;