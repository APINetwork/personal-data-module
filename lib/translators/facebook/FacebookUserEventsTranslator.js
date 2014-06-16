var moment = require( 'moment' ),
    async = require( 'async' );

function FacebookUserEventsTranslator() {
}

FacebookUserEventsTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:facebook:[0-9]+', '.*/fevents' ];
}

FacebookUserEventsTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var translatedEvents = new Array(),
      outputData = {},
      parseAccountId = sourceUri.match( /acct:facebook:[0-9]+/ ),
      parseId = parseAccountId[0].match( /[^\x3a]*$/i );
  var self = this;
  try {
    eventsData = JSON.parse(rawDoc.data).data;
  } catch( err) {
    SystemLog.log('FacebookStatusesFeedTranlater: Invalid JSON found in rawDoc[' + rawDoc.data + ']', err);
    callback(  err , null );
  }
  var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
  var source = parsedUri[3];
  async.forEachSeries(eventsData, function(event, callback_s1) {
    // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft
    // spec (opensocial-social-data-specification-2-5-0-draft):
    // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
    try {
      var translatedEvent = self.translateEvent(owner, source, event);
      outputData = {
        'sourceUri': sourceUri,
        'uri': 'apinetwork://' + owner + '//@' + source + '/fevents/' + event.id,
        'owner': owner,
        'category': 'event',
        'data': translatedEvent,
        'time': moment(translatedEvent.created_time).valueOf()
      };
      translatedEvents.push(outputData);
      callback_s1();
    } catch(error) {
      callback_s1(error);
    }
  }, function () {
    callback(null, {
      'uri': sourceUri,
      'data': translatedEvents
    });
  });
};

FacebookUserEventsTranslator.prototype.translateEvent = function( owner, source, rawEvent ) {
  var result = {
    'type': (rawEvent.type || null),
    'timezone': (rawEvent.timezone || null),
    'venue': (rawEvent.venue || null),
    'name': (rawEvent.name || null),
    'start_time': (rawEvent.start_time || null),
    'end_time': (rawEvent.end_time || null),
    'rsvp_status': (rawEvent.rsvp_status || null),
    'description': (rawEvent.description || null),
    'cover': (rawEvent.location || null),
    'location': (rawEvent.cover || null),
    'location': (rawEvent.location || null),
    'privacy': (rawEvent.privacy || null),
    'icon': (rawEvent.icon || null),
    'appData': {
      'serviceName': 'Facebook',
      'serviceImgUrl': '/images/512x512-logos/facebook.png'
    },
    'id': 'apinetwork://' + owner + '//@' + source + '/flinks/' + rawEvent.id,
    'created_time': moment(rawEvent.created_time).valueOf(),
    'updated_time' : moment(rawEvent.updated_time).valueOf(),
    'itemtype': 'FacebookEvent'
  };
  return result;
};
module.exports = exports = FacebookUserEventsTranslator;