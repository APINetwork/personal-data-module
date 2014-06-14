var base = require( '../ProducerBase.js' );

function DirectMessageProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( DirectMessageProducer );

DirectMessageProducer.prototype.init = function( done ) {
	done();
}
DirectMessageProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '^/direct/[0-9]+' ];
}
DirectMessageProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
	var messageId = resource.match( /^\/direct\/([0-9]+)/ )[1];

	tokenStore.getUserTokens( owner, source, function( error, data ) {

		var twit = new twitter( {
			consumer_key: data.consumerKey,
			consumer_secret: data.consumerSecret,
			access_token_key: data.token,
			access_token_secret: data.tokenSecret
		});

		twit.get( 
			'/direct_messages/show', 
			{ 
				id: messageId
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
module.exports = exports = DirectMessageProducer;
