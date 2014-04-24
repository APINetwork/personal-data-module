var moment = require( 'moment' ),
    async = require( 'async' );

function FacebookUserLinksTranslator() {
}

FacebookUserLinksTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '.*/flinks' ];
}

FacebookUserLinksTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var translatedLists = new Array(),
      outputData = {},
      parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    linksData = JSON.parse(rawDoc.data).data;
  } catch( err) {
    SystemLog.log('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(  err , null );
  }
  var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
  var source = parsedUri[3];
  async.forEachSeries(linksData, function(link, callback_s1) {
    // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
    // spec (opensocial-social-data-specification-2-5-0-draft):
    // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
    try {
      var translatedLink = self.translateLink(owner, source, link);
      outputData = {
        'sourceUri': sourceUri,
        'uri': 'ldengine://' + owner + '//@' + source + '/flists/' + link.id,
        'owner': owner,
        'category': 'list',
        'data': translatedLink,
        'time': moment(translatedLink.created_time).valueOf()
      };
      translatedLists.push(outputData);
      callback_s1();
    } catch(error) {
      callback_s1(error);
    }
  }, function () {
    callback(null, {
      'uri': sourceUri,
      'data': translatedLists
    });
  });
};

FacebookUserLinksTranslator.prototype.translateLink = function( owner, source, rawList ) {
  var result = {
    'message': (rawList.message || null),
    'from': (rawList.from || null),
    'name': (rawList.name || null),
    'link': (rawList.link || null),
    'description': (rawList.description || null),
    'privacy': (rawList.privacy || null),
    'icon': (rawList.icon || null),
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png'
    },
    'id': 'ldengine://' + owner + '//@' + source + '/flinks/' + rawList.id,
    'created_time': moment(rawList.created_time).valueOf(),
    'updated_time' : moment(rawList.updated_time).valueOf(),
    'itemtype': 'FacebookLink'
  };
  return result;
};
module.exports = exports = FacebookUserLinksTranslator;