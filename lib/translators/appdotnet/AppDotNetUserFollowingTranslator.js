
function AppDotNetUserFollowingTranslator() {
}

AppDotNetUserFollowingTranslator.prototype.getMatchPatterns = function() {
    return [ '^acct:appdotnet:[0-9]+', '.*/user/following' ];
}
AppDotNetUserFollowingTranslator.prototype.translate = function( sourceUri, owner, rawDoc, callback ) {
    try {

		var parsedUri = sourceUri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
		var source = parsedUri[3];

		var translatedUserFollowing = new Array();

		//Profiles for follower or following users
        var userProfiles = JSON.parse(rawDoc.data);  
			
        // Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
        // spec (opensocial-social-data-specification-2-5-0-draft):
        // http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml

        async.eachSeries(
        	userProfiles.data,
        	function( profile, done ) {
				var uri = 'apinetwork://' + owner + '//@' + source + '/user/' + profile.id;
				translatedUserFollowed = this.translateUserFollowed( uri, profile );
				translatedUserFollowing.push( translatedUserFollowed );
		       	var outputData = {
					'sourceUri': sourceUri,
					'uri': uri, 
					'owner': owner,
					'category': 'person',
					'data': translatedUserFollowed
				};

	   			done();
     		},
        	function( error ) {
		        process.nextTick( function() {
		            callback( error, translatedUserFollowing );
		        });
			}
		);
    } catch( err ) { 
        callback(  err , null ); 
	}
};
AppDotNetUserFollowingTranslator.prototype.translateUserFollowed = function( uri, rawUser) { 	
	if (rawUser.hasOwnProperty("description")) 
		 var aboutMeText = rawUser.description.text; 
	else 
	         var aboutMeText  =   'User info not available.'; 
		
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
		'aboutMe': aboutMeText,
		'urls': [ rawUser.canonical_url ],
		'utcOffset': rawUser.timezone,
		'languagesSpoken': [ rawUser.locale ],
	 };
			
};
module.exports = exports = AppDotNetUserFollowingTranslator;
