var Moment = require( 'moment' );
var BigNumber = require( './bignumber.js' );

var base = require( '../ProducerBase.js' );
function TwitterTweetIndexProducer( fetcher ) {
	this.fetcher = fetcher;
	base.init( this );
}
base.inherit( TwitterTweetIndexProducer );

TwitterTweetIndexProducer.prototype.init = function( done ) {
	done();
}
TwitterTweetIndexProducer.prototype.getMatchPatterns = function() {
	return [ '^acct:twitter:[0-9]+', '/status/sent' ];
}
TwitterTweetIndexProducer.prototype.attemptRequest = function( uri, owner, source, resource, keys, callback ) {
	var self = this;

	var userId = source.match( /^acct:twitter:([0-9]+)/ )[1];

	var sinceMatch = resource.match( '[?&]since=([0-9]+)' );
	var since = null;
	if( sinceMatch != null )
		since = parseInt( sinceMatch[1] );

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
	self.getSomeTweetsPriorTo( null, userId, keys, requestPriorTweets );
};
TwitterTweetIndexProducer.prototype.getSomeTweetsPriorTo = function( maxId, userId, keys, callback ) {
	var url;
	if( maxId != null )
		url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=200&user_id=' + userId + '&max_id=' + maxId;
	else
		url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=200&user_id=' + userId;
	this.getUrlUsingOauth( url, keys, function( err, data ){
		try {
			if( err == null )
			{
				var parsedData = JSON.parse( data );
				var minimumReceived = maxId;
				if( parsedData.length == 0 )
					callback( null, null, null );
				else
				{
					for( var i=0; i<parsedData.length; i++ )
					{
						var id = new BigNumber( parsedData[i].id_str );
						if( minimumReceived == null || 
							id.compare( minimumReceived ) < 0 )
							minimumReceived = id;
					}
					callback( null, parsedData, minimumReceived );
				}
			}
			else
			{
				callback( err, null, null );
			}
		} catch( err ){ 
			callback( err, null, null );
		}
	} );
};
TwitterTweetIndexProducer.prototype.getUrlUsingOauth = function( url, keys, callback ) {
	var self = this;
	var retryCount = 0;
	var retryRequest = function( err, data, res ) {
		if( err )
		{
			if( retryCount < 10 )
			{
				retryCount++;
				self.oauth.get( url, keys.token, keys.tokenSecret, retryRequest );
			}
			else
				callback( err, null );
		}
		else
			callback( null, data );
	}
	self.oauth.get( url, keys.token, keys.tokenSecret,retryRequest );
}
module.exports = exports = TwitterTweetIndexProducer;
