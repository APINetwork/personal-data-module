var base = require( '../ProducerBase.js' );
var twitter = require('mtwitter');

function TweetProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( TweetProducer );

TweetProducer.prototype.init = function( done ) {
	done();
}
TweetProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '^/status/[0-9]+' ];
}
TweetProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source, resource, keys, callback ) {
	var userId = resource.match( /^\/status\/([0-9]+)/ )[1];

	tokenStore.getUserTokens( owner, source, function( error, data ) {

		var twit = new twitter( {
			consumer_key: data.consumerKey,
			consumer_secret: data.consumerSecret,
			access_token_key: data.token,
			access_token_secret: data.tokenSecret
		});

		twit.get( 
			'/statuses/show', 
			{ 
				id: userId
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
module.exports = exports = TweetProducer;
