var Moment = require( 'moment' ),
    async = require( 'async' );


function TwitterDirectMessagesReceivedTranslator() {
}

TwitterDirectMessagesReceivedTranslator.prototype.getMatchPatterns = function() {
  return [ '^acct:twitter:[0-9]+', '/direct/received' ];
}

TwitterDirectMessagesReceivedTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
  var self = this;
  console.log("TwitterDirectMessagesReceivedTranslator : translate " + JSON.stringify(rawDoc));

}
module.exports = exports = TwitterDirectMessagesReceivedTranslator;