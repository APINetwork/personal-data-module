var Moment = require( 'moment' ),
	async = require( 'async' );

function AppDotNetPostCreatedTranslator() {
}

AppDotNetPostCreatedTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:appdotnet:[0-9]+', '.*/posts/created' ]; 
}
AppDotNetPostCreatedTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
    try {
		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
		var source = parsedUri[3];

		var translatedMessages = new Array();
		
		var postsData = JSON.parse(rawDoc.data);	
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
		// spec (opensocial-social-data-specification-2-5-0-draft):
		// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
		async.eachSeries( 
			postsData.data,
			function( post, done ) {
				var uri = 'apinetwork://' + owner + '//@' + source + '/user/' + post.user.id;
				var outputData = {
					'sourceUri': sourceUri,
					'uri': uri,
					'owner': owner,
					'category': 'person',
					'data': this.translateUser( uri, postsData.data[i].user )
				};

				var translatedMessage = this.translateMessage( owner, source, post );					
				translatedMessages.push( translatedMessage );
				
				var outputData = { 
					'sourceUri': sourceUri,
					'uri': 'apinetwork://' + owner + '//@' + source + '/post/' + post.id,
					'owner': owner,
					'category': 'message',
					'data': translatedMessage,
					'time': Moment( translatedMessage.timeSent ).valueOf()
				};

	   			done();
			},
			function( error ) {
		        process.nextTick( function() {
		            callback( error, translatedMessages );
		        });
			}
		);
	} catch( err ) {
        callback(  err , null );	
	}
};
AppDotNetPostCreatedTranslator.prototype.translateUser = function( uri, rawUser ) {
		
	return { 
		// Required fields by spec
		'id': uri,
		'displayName': {'formatted': rawUser.name },

		// Additional required fields for UI
		'preferredUsername': '@' + rawUser.username,
		'thumbnailUrl': rawUser.avatar_image.url,
		'appData': { 
			'serviceName': 'App.Net',
			'serviceImgUrl': '/512x512-logos/app_net.png',
			// Plus other app data that isn't required.
			'verified': rawUser.verified, 
		},

		// Everything else
		'location': rawUser.timezone,
		'aboutMe': rawUser.description.text,
		'urls': [ rawUser.canonical_url ],
		'utcOffset': rawUser.timezone,
		'languagesSpoken': [ rawUser.locale ],
	 };
};
AppDotNetPostCreatedTranslator.prototype.translateMessage = function( owner, source, rawMessage ) {
	return {
				'body': rawMessage.text,
				'id': 'apinetwork://' + owner + '//@' + source + '/post/' + rawMessage.id,
				'userId': 'apinetwork://' + owner + '//@' + source + '/user/' + rawMessage.user.id,
				'timeSent': Date.parse(rawMessage.created_at),
				'itemtype': 'message'
			};
};
module.exports = exports = AppDotNetPostCreatedTranslator;
