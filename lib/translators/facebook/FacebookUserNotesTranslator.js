var moment = require( 'moment' ),
    async = require( 'async' );

function FacebookUserNotesTranslator() {
}

FacebookUserNotesTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '.*/fnotes' ];
}

FacebookUserNotesTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var translatedNotes = new Array(),
      outputData = {},
      parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    notesData = JSON.parse(rawDoc.data).data;
  } catch( err) {
    SystemLog.log('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(  err , null );
  }
  var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
  var source = parsedUri[3];
  async.forEachSeries(notesData, function(note, callback_s1) {
    // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
    // spec (opensocial-social-data-specification-2-5-0-draft):
    // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
    try {
      var translatedNote = self.translateNote(owner, source, note);
      outputData = {
        'sourceUri': sourceUri,
        'uri': 'ldengine://' + owner + '//@' + source + '/fnotes/' + note.id,
        'owner': owner,
        'category': 'note',
        'data': translatedNote,
        'time': moment(translatedNote.created_time).valueOf()
      };
      translatedNotes.push(outputData);
      callback_s1();
    } catch(error) {
      callback_s1(error);
    }
  }, function () {
    callback(null, {
      'uri': sourceUri,
      'data': translatedNotes
    });
  });
};

FacebookUserNotesTranslator.prototype.translateNote = function(owner, source, rawNote) {
  var result = {
    'from': (rawNote.from || null),
    'subject': (rawNote.subject || null),
    'message': (rawNote.message || null),
    'icon': (rawNote.icon || null),
    'comments': (rawNote.comments || null),
    'shared_posts': (rawNote.sharedPosts || null),
    'limit': (rawNote.limit || null),
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png'
    },
    'id': 'ldengine://' + owner + '//@' + source + '/fnotes/' + rawNote.id,
    'created_time': moment(rawNote.created_time).valueOf(),
    'updated_time' : moment(rawNote.updated_time).valueOf(),
    'itemtype': 'FacebookNote'
  };
  return result;
};
module.exports = exports = FacebookUserNotesTranslator;