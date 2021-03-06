var Moment = require( 'moment' );
var BigNumber = require( './bignumber.js' );
var twitter = require( 'mtwitter' );

var base = require( '../ProducerBase.js' );
function TwitterMentionsProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( TwitterMentionsProducer );

TwitterMentionsProducer.prototype.init = function( done ) {
	done();
}
TwitterMentionsProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '/status/mentions' ];
}
TwitterMentionsProducer.prototype.attemptRequest = function( tokenStore, uri, owner, source, resource, keys, callback ) {
	var self = this;

	var userId = source.match( /^acct:twitter:([0-9]+)/ )[1];

	var sinceMatch = resource.match( '[?&]since=([0-9]+)' );
	var since = null;
	if( sinceMatch != null )
		since = parseInt( sinceMatch[1] );

	tokenStore.getUserTokens( owner, source, function( error, tokens ) {
		var tweetSets = new Array();
		var requestPriorTweets = function( err, data, minimumReceived ) {
			if( err == null )
			{
				if( data != null )
				{
					if( since == null ){
						data.forEach( function ( item ) {
							tweetSets.push( item );
						});
						self.getSomeTweetsPriorTo( minimumReceived.subtract( 1 ), userId, keys, requestPriorTweets );
					}
					else
					{
						var earliest = Moment().valueOf();

						data.forEach( function ( item ) {
							var itemDate = Moment( item.created_at ).valueOf();
							if( itemDate < earliest )
								earliest = itemDate;
							if( since <= itemDate )
								tweetSets.push( item );
						} );

						if( since <= earliest )
						{
							self.getSomeTweetsPriorTo( minimumReceived.subtract( 1 ), userId, keys, requestPriorTweets );
						}
						else
						{
							callback( null, { 
								'uri': uri,
								'data': tweetSets
							 } );	
						}
					}
				}
				else
				{
					callback( null, { 
						'uri': uri,
						'data': tweetSets
					 } );	
				}
			}
			else
			{
				callback( err, null );
			}
		};
		self.getSomeTweetsPriorTo( null, userId, tokens, requestPriorTweets );
	});
};
TwitterMentionsProducer.prototype.getSomeTweetsPriorTo = function( maxId, userId, keys, callback ) {
	try {
		// WARNING!  DON'T TRY TO OPTIMIZE THIS!  Twitter requires that the options be 
		//    IN ALPHABETICAL ORDER!
		if( maxId == null )
			var options = {
				count: 200,
				include_rts: 1,
				user_id: userId
			};
		else
			var options = {
				count: 200,
				include_rts: 1,
				max_id: maxId.toString(),
				user_id: userId
			};

	    var twit = new twitter({
	      consumer_key: keys.consumerKey ,
	      consumer_secret: keys.consumerSecret,
	      access_token_key: keys.token,
	      access_token_secret: keys.tokenSecret
	    });


	    twit.get('/statuses/mentions_timeline', options,
	      function ( err, data ) {
	        if (err) {
	          callback( err );
	        } else {
				var minimumReceived = maxId;
				if( data.length == 0 )
					callback( null, null, null );
				else
				{
					for( var i=0; i<data.length; i++ )
					{
						var id = new BigNumber( data[i].id_str );
						if( minimumReceived == null || 
							id.compare( minimumReceived ) < 0 )
							minimumReceived = id;
					}
					callback( null, data, minimumReceived );
				}
			}
		} );
	} catch( err ) {
		callback( err, null, null );
	}
};
module.exports = exports = TwitterMentionsProducer;
