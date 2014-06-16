var Moment = require( 'moment' ),
	async = require( 'async' );

function TwitterTweetTranslator() {
}
TwitterTweetTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '/status/.*' ];
}
TwitterTweetTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
	try {
		var self = this;
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
		// spec (opensocial-social-data-specification-2-5-0-draft):
		// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml

		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)\/.*/ );
		var source = parsedUri[3];

		var translatedMessages = new Array();
		async.eachSeries(
			rawDoc.data,
			function( tweet, done ) {
    			try
				{
					var uri = 'apinetwork://' + owner + '//@' + source + '/user/' + tweet.user.id_str;
					var outputData = {
						'category': 'person',
						'uri': uri,
						'owner': owner,
						'data': self.translateUser( uri, tweet.user )
					};

					var translatedMessage = self.translateMessage( owner, source, tweet );
					translatedMessages.push( translatedMessage );
					var outputData = {
						'sourceUri': sourceUri,
						'category': 'message',
						'uri': 'apinetwork://' + owner + '//@' + source + '/status/' + tweet.id,
						'owner': owner,
						'data': translatedMessage,
						'time': Moment( translatedMessage.timeSent ).valueOf()
					};

					done();
				}
				catch( error )
				{
					done( error );
				}

			},
			function( error ) {
				process.nextTick( function() {
					callback( error, translatedMessages );
				});
			}
		);
    }
	catch( error )
	{
		callback( error );
	}
};
TwitterTweetTranslator.prototype.translateUser = function( uri, rawUser ) {
	return { 
		// Required fields by spec
		'id': uri,
		'displayName': {'formatted': rawUser.name },

		// Additional required fields for UI
		'preferredUsername': '@' + rawUser.screen_name,
		'thumbnailUrl': rawUser.profile_image_url,
		'appData': { 
			'serviceName': 'Twitter',
			'serviceImgUrl': '/512x512-logos/twitter.png',
			// Plus other app data that isn't required.
			'verified': rawUser.verified,
		},

		// Everything else
		'location': rawUser.location,
		'aboutMe': rawUser.description,
		'urls': [ rawUser.url ],
		'utcOffset': rawUser.utc_offset,
		'languagesSpoken': [ rawUser.lang ],
	 };
};
TwitterTweetTranslator.prototype.translateMessage = function( owner, source, rawMessage ) {
	var translatedMessage = {
                		'appData': {
                        		'serviceName': 'Twitter'
				},
				'body': rawMessage.text,
				'id': 'apinetwork://' + owner + '//@' + source + '/status/' + rawMessage.id_str,
				'senderId': 'apinetwork://' + owner + '//@' + source + '/user/' + rawMessage.user.id,
				'geo': rawMessage.geo || rawMessage.coordinates,
				'timeSent': Date.parse(rawMessage.created_at),
				'itemtype': 'Tweet',
			};

	if( rawMessage.in_reply_to_status_id_str )
		translatedMessage.inReplyTo = 'apinetwork://' + owner + '//@' + source + '/status/' + rawMessage.in_reply_to_status_id_str;

	return translatedMessage;
};
module.exports = exports = TwitterTweetTranslator;
