var Moment = require( 'moment' ),
    async = require( 'async' );

function FacebookContactListTranslator() {
}

FacebookContactListTranslator.prototype.getMatchPatterns = function() {
  return [  '^acct:facebook:[0-9]+', '.*/contacts'  ];
}

FacebookContactListTranslator.prototype.translate = function(sourceUri, owner, rawDoc, callback) {
  var self = this;
  var contactsData = rawDoc.data;
  var dataKeys = Object.keys(contactsData);

  var parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i ),
      translatedContacts = new Array();
  var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
  var source = parsedUri[3];

  async.forEachSeries(contactsData, function(contact, callback_s1) {
    var obj = JSON.parse(contact);
    try {
      var uri = 'ldengine://' + owner + '//@' + source + '/user/' + obj.username;
      var translatedContact = self.translateContact(uri, obj);
      var outputData = {
        'sourceUri': sourceUri,
        'uri': uri,
        'owner': owner,
        'category': 'person',
        'data': translatedContact
      };
      translatedContacts.push(outputData);
      callback_s1();
    } catch( error ) {
      callback_s1(error);
    }
  }, function () {
    callback(null, {
      'uri': sourceUri,
      'data': translatedContacts
    });
  });
};

FacebookContactListTranslator.prototype.translateContact = function( uri, rawUser ) {
  return {
    // Required fields by spec
    'id': uri,
    'displayName': {'formatted': rawUser.first_name + rawUser.last_name },
     'gender' : rawUser.gender,
    // Additional required fields for UI
    'preferredUsername':  rawUser.username,
    'thumbnailUrl': rawUser.picture.data.url,
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png',
      // Plus other app data that isn't required.
      'verified': rawUser.is_silhouette
    },
    // Everything else
    'location': [rawUser.timezone || null],
    'aboutMe': [rawUser.bio || null],
    'urls': [ rawUser.link || null ],
    'utcOffset': rawUser.locale || null,
    'languagesSpoken': [ rawUser.locale || null ]
  };

};
module.exports = exports = FacebookContactListTranslator;