var moment = require( 'moment' ),
    async = require( 'async' );

function FacebookUserGroupsTranslator() {
}

FacebookUserGroupsTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '.*/fgroups' ];
}


FacebookUserGroupsTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var translatedGroups = new Array(),
      outputData = {},
      parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    groupsData = JSON.parse(rawDoc.data).data;
  } catch( err) {
    SystemLog.log('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(  err , null );
  }
  var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
  var source = parsedUri[3];
  async.forEachSeries(groupsData, function(group, callback_s1) {
    // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
    // spec (opensocial-social-data-specification-2-5-0-draft):
    // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
    try {
      var translatedGroup = self.translateGroup(owner, source, group);
      outputData = {
        'sourceUri': sourceUri,
        'uri': 'ldengine://' + owner + '//@' + source + '/fnews/' + group.id,
        'owner': owner,
        'category': 'group',
        'data': translatedGroup
      };
      translatedGroups.push(outputData);
      callback_s1();
    } catch(error) {
      callback_s1(error);
    }
  }, function () {
    callback(null, {
      'uri': sourceUri,
      'data': translatedGroups
    });
  });
};


FacebookUserGroupsTranslator.prototype.translateGroup = function( owner, source, rawGroup ) {
  var result = {
    //TODO populate fields
    'name': rawGroup.name,
    'description': (rawGroup.description || null),
    'icon': (rawGroup.icon || null),
    'bookmark_order': (rawGroup.bookmark_order || null),
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png'
    },
    'id': 'ldengine://' + owner + '//@' + source + '/fgroups/' + rawGroup.id,
    'administrator': (rawGroup.administrator || null),
    'email' : (rawGroup.email || null),
    'itemtype': 'FacebookGroup'

  };
  return result;
};
module.exports = exports = FacebookUserGroupsTranslator;