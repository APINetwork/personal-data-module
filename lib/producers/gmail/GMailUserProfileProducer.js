var base = require( '../ProducerBase.js' );
var googleBase = require( '../GoogleProducerBase' );

function GMailUserProfileProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
googleBase.inherit( GMailUserProfileProducer );
base.inherit( GMailUserProfileProducer );

GMailUserProfileProducer.prototype.init = function( done ) {
	done();
}
GMailUserProfileProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:gmail:[0-9]+', '/user/[0-9]+' ];
}
GMailUserProfileProducer.prototype.getDataUrl = function( resource ) {
	return 'https://www.googleapis.com/oauth2/v1/userinfo';
}
GMailUserProfileProducer.prototype.processData = function( uri, owner, source, resource, data, callback ) {
	var desiredUserId = resource.match( /^\/user\/([0-9]+)/ )[1];

	try {
		if( desiredUserId != JSON.parse( data ).id )
		{
			callback( 
				new Error( 'GMailUserProfileProducer only supports getting the user profile of the logged in user, currently.' ), null );
		}
		else
		{
			callback( null, {
				'uri': uri,
				'data': data
			} );

		}
	} catch( error ) {
		callback( error, null );
	}
}

module.exports = exports = GMailUserProfileProducer;