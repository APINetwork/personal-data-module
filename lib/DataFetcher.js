var RegExLookup = require( './RegExLookup.js' );

function DataFetcher( tokenStore ) {
	this.tokenStore = tokenStore;
	this.docProducerRegistry = new RegExLookup();
	this.translatorRegistry = new RegExLookup();
}
DataFetcher.prototype.registerDocProducer = function( DocProducer ) {
	var docProducer = new DocProducer( this );
	var matchPatterns = docProducer.getMatchPatterns();
  console.log("matchPatterns[0] :" +matchPatterns[0]+ " matchPatterns[1] :"+matchPatterns[1]);
	this.docProducerRegistry.register( docProducer, matchPatterns[0], matchPatterns[1] );
}
DataFetcher.prototype.registerTranslator = function( Translator ) {
  //console.log("matchPatterns[0] :" +matchPatterns[0]+ " matchPatterns[1] :"+matchPatterns[1]);
	var translator = new Translator( this );
	var matchPatterns = translator.getMatchPatterns();
	this.translatorRegistry.register( translator, matchPatterns[0], matchPatterns[1] );
}
DataFetcher.prototype.fetch = function( uri, callback ) {
	var startTime = new Date().valueOf();
	var dataManager = this;
	var schemeMatch = uri.match( /^([^:]*):/ );
	if( schemeMatch != null )
	{
		var scheme = schemeMatch[1];

		if( scheme == 'ldengine' ) {
			var parsedUri = uri.match( /([^:]*):\/\/(.*)\/\/@([^\/]*)(.*)/ );
			var userId = parsedUri[2];
			var source = parsedUri[3];
			var resource = parsedUri[4];

			var docProducer = dataManager.docProducerRegistry.get( source, resource );
			if( docProducer )
			{
				var translationDone = false;
				var timeout = setTimeout( function() {
					callback( new Error( 'Document production and translation took more than 30 seconds, or did not finish at all!  URI was: ' + uri ));
				}, 30000 );
				try {
          docProducer.produce( uri, userId, source, resource,
						function( err, rawDoc ) {
							var elapsedTime = new Date().valueOf() - startTime;
							if( err )
							{
								clearTimeout( timeout );
								callback( {
									'error': err,
									'userId': userId,
						      		'source': source,
						      		'resource': resource
								}, null );
							}
							else
							{
								try {
									dataManager.translateDocument(
										uri, userId, source, resource, rawDoc, function( error, result ) {
											clearTimeout( timeout );
											callback( error, result );
										} );
								} catch( error )
								{
									clearTimeout( timeout );
									callback( error );
								}
							}
						}
					);
				}
				catch( e )
				{
					clearTimeout( timeout );
					callback( e );
				}
			}
			else
			{
				callback( new Error( 'No document producer for URI: ' + uri+ ' source :' + source + ' resource :' + resource ), null );
			}
		}
		else
		{
			callback( new Error( 'Unknown scheme: ' + scheme ), null );
		}
	}
	else
		callback( new Error( 'Bad URI Format: ' + uri ), null );

}
DataFetcher.prototype.translateDocument = function( uri, userId, source, resource, rawDoc, callback ) {

	var startTime = new Date().valueOf();
	var translator = this.translatorRegistry.get( source, resource );
	if( translator )
		translator.translate( uri, userId, rawDoc, function( error, result ) {
			var elapsedTime = new Date().valueOf() - startTime;
			callback( error, result );
		} );
	else
		callback( new Error( 'No document translator for URI: ' + uri ), null );
}

module.exports = exports = DataFetcher;
