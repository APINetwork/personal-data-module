function TwitterUserProfileTranslator() {
}
TwitterUserProfileTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '/user/[0-9]+' ];
}
TwitterUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	try {
		var userProfile = rawDoc.data;
	
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
		// spec (opensocial-social-data-specification-2-5-0-draft):
		// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
		var result = {
			
			// Required fields by spec
			'id': uri,
			'displayName': {'formatted': userProfile.name },

			// Additional required fields for UI
			'preferredUsername': '@' + userProfile.screen_name,
			'thumbnailUrl': userProfile.profile_image_url,
			'appData': { 
				'serviceName': 'Twitter',
				'serviceImgUrl': '/images/512x512-logos/twitter.png',
				// Plus other app data that isn't required.
				'verified': userProfile.verified,
			},

			// Everything else
  			'location': userProfile.location,
  			'aboutMe': userProfile.description,
  			'urls': [ userProfile.url ],
  			'utcOffset': userProfile.utc_offset,
  			'languagesSpoken': [ userProfile.lang ],
		 };

		 if( userProfile.status )
		 	result.status = userProfile.status.text;

		var outputData = {
			'uri': uri,
			'owner': owner,
			'category': 'person',
			'data': result
		};
		process.nextTick( function() {
    		callback( null, outputData.data );
    	});
	} catch( err ) {
        callback(  err , null );
	}
};
module.exports = exports = TwitterUserProfileTranslator;
