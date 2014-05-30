var base = require( '../ProducerBase.js' ),
	twitter = require( 'mtwitter' );

function TwitterUserProfileProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( TwitterUserProfileProducer );

TwitterUserProfileProducer.prototype.init = function( done ) {
	done();
}
TwitterUserProfileProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '/user/[0-9]+' ];
}
TwitterUserProfileProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source, resource, keys, callback ) {
	var self = this;
	var userId = resource.match(/^\/user\/([0-9]+)/)[1];

	tokenStore.getUserTokens( owner, source, function( error, data ) {

		var twit = new twitter( {
			consumer_key: data.consumerKey,
			consumer_secret: data.consumerSecret,
			access_token_key: data.token,
			access_token_secret: data.tokenSecret
		});

		twit.get( 
			'/users/show', 
			{ 
				user_id: userId,
				include_entities: true
			},
	        function (err, data) {
				if (err) {
					callback( err );
				} else {
					callback(null, {
						'uri': uri,
						'data': data
					});
				}
			}
		);
	});

};
module.exports = exports = TwitterUserProfileProducer;
