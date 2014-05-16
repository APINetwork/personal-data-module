var moment = require( 'moment' ),
    async = require( 'async' );

function FacebookUserAlbumsTranslator() {
}

FacebookUserAlbumsTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '.*/falbums' ];
}

FacebookUserAlbumsTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var translatedAlbums = new Array(),
      outputData = {},
      parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    albumsData = JSON.parse(rawDoc.data).data;
  } catch( err) {
    SystemLog.log('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(  err , null );
  }
  var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
  var source = parsedUri[3];
  async.forEachSeries(albumsData, function(album, callback_s1) {
    // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
    // spec (opensocial-social-data-specification-2-5-0-draft):
    // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
    try {
      var translatedAlbum = self.translateAlbum(owner, source, album);
      outputData = {
        'sourceUri': sourceUri,
        'uri': 'ldengine://' + owner + '//@' + source + '/fnotes/' + album.id,
        'owner': owner,
        'category': 'album',
        'data': translatedAlbum,
        'time': moment(translatedAlbum.created_time).valueOf()
      };
      translatedAlbums.push(outputData);
      callback_s1();
    } catch(error) {
      callback_s1(error);
    }
  }, function () {
    callback(null, {
      'uri': sourceUri,
      'data': translatedAlbums
    });
  });
};

FacebookUserAlbumsTranslator.prototype.translateAlbum = function(owner, source, rawAlbum) {
  var result = {
    'from': (rawAlbum.from || null),
    'name': (rawAlbum.name || null),
    'link': (rawAlbum.link || null),
    'icon': (rawAlbum.icon || null),
    'cover_photo': (rawAlbum.cover_photo || null),
    'privacy': (rawAlbum.privacy || null),
    'count': (rawAlbum.count || null),
    'type': (rawAlbum.type || null),
    'can_upload': (rawAlbum.can_upload || null),
    'description': (rawAlbum.description || null),
    'location': (rawAlbum.location || null),
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png'
    },
    'id': 'ldengine://' + owner + '//@' + source + '/falbums/' + rawAlbum.id,
    'created_time': moment(rawAlbum.created_time).valueOf(),
    'updated_time' : moment(rawAlbum.updated_time).valueOf(),
    'itemtype': 'FacebookAlbum'
  };
  return result;
};
module.exports = exports = FacebookUserAlbumsTranslator;