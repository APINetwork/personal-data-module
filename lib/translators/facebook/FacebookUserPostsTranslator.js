var moment = require( 'moment' ),
    async = require( 'async' );

function FacebookUserPostsTranslator() {
}

FacebookUserPostsTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '.*/fposts' ];
}

FacebookUserPostsTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var translatedPosts = new Array(),
      outputData = {},
      parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    postsData = JSON.parse(rawDoc.data).data;
  } catch( err) {
    SystemLog.log('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(  err , null );
  }
  var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
  var source = parsedUri[3];
  async.forEachSeries(postsData, function(post, callback_s1) {
    // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
    // spec (opensocial-social-data-specification-2-5-0-draft):
    // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
    try {
      var translatedPost = self.translatePost(owner, source, post);
      outputData = {
        'sourceUri': sourceUri,
        'uri': 'apinetwork://' + owner + '//@' + source + '/fposts/' + post.id,
        'owner': owner,
        'category': 'post',
        'data': translatedPost,
        'time': moment(translatedPost.created_time).valueOf()
      };
      translatedPosts.push(outputData);
      callback_s1();
    } catch(error) {
      callback_s1(error);
    }
  }, function () {
    callback(null, {
      'uri': sourceUri,
      'data': translatedPosts
    });
  });
};

FacebookUserPostsTranslator.prototype.translatePost = function( owner, source, rawPost ) {
  var result = {
    'picture': (rawPost.picture || null),
    'from': (rawPost.from || null),
    'story': (rawPost.story || null),
    'link': (rawPost.link || null),
    'icon': (rawPost.icon || null),
    'actions': (rawPost.actions || null),
    'privacy': (rawPost.privacy || null),
    'type': (rawPost.type || null),
    'link': (rawPost.link || null),
    'icon': (rawPost.icon || null),
    'tags': (rawPost.tags || null),
    'status_type': (rawPost.status_type || null),
    'application': (rawPost.application || null),
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png'
    },
    'id': 'apinetwork://' + owner + '//@' + source + '/fphotos/' + rawPost.id,
    'created_time': moment(rawPost.created_time).valueOf(),
    'updated_time' : moment(rawPost.updated_time).valueOf(),
    'itemtype': 'FacebookPost'
  };
  return result;
};
module.exports = exports = FacebookUserPostsTranslator;