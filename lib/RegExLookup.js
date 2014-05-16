function RegExLookup() {
	this.registry = new Array();
};

RegExLookup.prototype.register = function( item, topPattern, secondPattern ) {
	if( this.registry.hasOwnProperty( topPattern ))
	{
		var pathMatches = this.registry[ topPattern ];
		pathMatches[ secondPattern ] = item;
	}
	else
	{
		var newMapping = {};
		newMapping[ secondPattern ] = item;
		this.registry[ topPattern ] = newMapping;
	}

}
RegExLookup.prototype.get = function( topPattern, secondPattern ) {
	for( var sourceRegex in this.registry )
	{
		if( this.registry.hasOwnProperty( sourceRegex ))
		{
			if( topPattern.match( new RegExp( sourceRegex, '' )))
			{
				for( var resourceRegex in this.registry[ sourceRegex ])
					if( secondPattern.match( new RegExp( resourceRegex, '' ))) {
            return this.registry[ sourceRegex ][resourceRegex ];
          }
			}
		}
	}
	return null;
}
module.exports = exports = RegExLookup;