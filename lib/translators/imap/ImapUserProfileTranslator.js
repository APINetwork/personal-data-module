function ImapUserProfileTranslator() {
}
ImapUserProfileTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:((imap)|(gmail)):.+', '/user/.+' ];
}
ImapUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	try {
		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
		// spec (opensocial-social-data-specification-2-5-0-draft):
		// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
		var data = { 
			// Required fields by spec
			'id': uri,
			'displayName': {'formatted': rawDoc.username + '/' + rawDoc.server },

			// Additional required fields for UI
			'preferredUsername': rawDoc.username,
			'thumbnailUrl': '/images/generic_user_image.jpeg',
			'appData': { 
				'serviceName': 'IMAP',
				'serviceImgUrl': '/images/512x512-logos/email.png',
				// Plus other app data that isn't required.
			},
		 };

		var outputData = {
			'uri': uri,
			'owner': owner,
			'category': 'person',
			'data': data
		};
		process.nextTick( function() {
    		callback( null, outputData.data );
    	});

	} catch( err ) {
        callback(  err , null );
	}
};
module.exports = exports = ImapUserProfileTranslator;
