function EngineDataModule( options ) {
	this.tokenStore = options.tokenStore ? options.tokenStore : new ( require( './lib/DummyTokenStore' ))();
	this.fetcher = new ( require( './lib/DataFetcher' ) )( this.tokenStore );

// Document Producers
	if( !options.services || options.services.indexOf( 'twitter' ) >= 0 )
	{
		this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterUserProfileProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterTweetIndexProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterMentionsProducer' ) );
		//this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterIncomingRelationshipProducer' ) );
		//this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterIncomingPendingRelationshipProducer' ) );
		//this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterOutgoingPendingRelationshipProducer' ) );
		//this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterOutgoingRelationshipProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterDirectMessagesSentProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterDirectMessagesReceivedProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/twitter/TweetProducer' ) );
	    this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterUserFollowersProducer' ) );
	    this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterUserFollowsProducer' ) );
	    this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterUserPendingFollowersProducer' ) );
	    this.fetcher.registerDocProducer( require( './lib/producers/twitter/TwitterUserPendingFollowesProducer' ) );
	}

	if ( !options.services || options.services.indexOf( 'facebook' ) >= 0) {
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookUserProfileProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookContactListProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookNewsFeedProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookStatusesFeedProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookUserLikesProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookUserPhotosProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookUserGroupsProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookUserPostsProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookUserLinksProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookUserEventsProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookUserNotesProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookUserAlbumsProducer'));
		this.fetcher.registerDocProducer(require('./lib/producers/facebook/FacebookUserVideosProducer'));
	}

	if( !options.services || options.services.indexOf( 'app.net' ) >= 0 )
	{
		this.fetcher.registerDocProducer( require( './lib/producers/appdotnet/AppDotNetUserProfileProducer') );
		this.fetcher.registerDocProducer( require( './lib/producers/appdotnet/AppDotNetUserFollowingProducer') );
		this.fetcher.registerDocProducer( require( './lib/producers/appdotnet/AppDotNetUserFollowersProducer') );
		this.fetcher.registerDocProducer( require( './lib/producers/appdotnet/AppDotNetPostCreatedProducer') );
		this.fetcher.registerDocProducer( require( './lib/producers/appdotnet/AppDotNetPostMentionsProducer') );
	}

	if( !options.services || options.services.indexOf( 'googlecontacts' ) >= 0 )
	{
		this.fetcher.registerDocProducer( require( './lib/producers/googlecontacts/GoogleContactsUserProfileProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/googlecontacts/GoogleContactsContactListProducer' ) );
	}

	if( !options.services || options.services.indexOf( 'imap' ) >= 0 )
	{
		this.fetcher.registerDocProducer( require( './lib/producers/imap/ImapUserProfileProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/imap/ImapMailboxListProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/imap/ImapMailboxContentsProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/imap/ImapMessageIdMessageProducer' ));
		this.fetcher.registerDocProducer( require( './lib/producers/imap/ImapUidMessageProducer' ));
		this.fetcher.registerDocProducer( require( './lib/producers/imap/ImapMessageProducer' ));
	}

	if( !options.services || options.services.indexOf( 'googlecalendars' ) >= 0 )
	{
		this.fetcher.registerDocProducer( require( './lib/producers/googlecalendars/GoogleCalendarsUserProfileProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/googlecalendars/GoogleCalendarsCalendarListProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/googlecalendars/GoogleCalendarsEventListProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/googlecalendars/GoogleCalendarsEventProducer' ) );
	}

	if( !options.services || options.services.indexOf( 'gmail' ) >= 0 )
	{
		//this.fetcher.registerDocProducer( require( './lib/producers/gmail/GMailUserProfileProducer' ) );
		this.fetcher.registerDocProducer( require( './lib/producers/gmail/GMailMessageProducer' ) );
	}

// Document Translators

	if( options.services && options.services.indexOf( 'twitter' ) >= 0 )
	{
		this.fetcher.registerTranslator( require( './lib/translators/twitter/TwitterUserProfileTranslator'));
		this.fetcher.registerTranslator( require( './lib/translators/twitter/TwitterDirectMessageTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/twitter/TwitterTweetTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/twitter/TwitterUserFollowersTranslator'));
		this.fetcher.registerTranslator( require( './lib/translators/twitter/TwitterUserFollowsTranslator'));
		this.fetcher.registerTranslator( require( './lib/translators/twitter/TwitterUserPendingFollowersTranslator'));
		this.fetcher.registerTranslator( require( './lib/translators/twitter/TwitterUserPendingFollowesTranslator'));
	}

	if ( !options.services || options.services.indexOf( 'facebook' ) >= 0) {
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookUserProfileTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookContactListTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookNewsFeedTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookStatusesFeedTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookUserLikesTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookUserPhotosTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookUserGroupsTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookUserPostsTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookUserLinksTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookUserEventsTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookUserNotesTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookUserAlbumsTranslator'));
		this.fetcher.registerTranslator(require('./lib/translators/facebook/FacebookUserVideosTranslator'));
	}

	if( !options.services || options.services.indexOf( 'app.net' ) >= 0 )
	{
		this.fetcher.registerTranslator( require( './lib/translators/appdotnet/AppDotNetUserProfileTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/appdotnet/AppDotNetPostMentionTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/appdotnet/AppDotNetUserFollowersTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/appdotnet/AppDotNetUserFollowingTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/appdotnet/AppDotNetPostCreatedTranslator' ));
	}

	if( !options.services || options.services.indexOf( 'googlecontacts' ) >= 0 )
	{
		this.fetcher.registerTranslator( require( './lib/translators/googlecontacts/GoogleContactsUserProfileTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/googlecontacts/GoogleContactsContactListTranslator' ));
	}

	if( !options.services || options.services.indexOf( 'googlecalendars' ) >= 0 )
	{
		this.fetcher.registerTranslator( require( './lib/translators/googlecalendars/GoogleCalendarsUserProfileTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/googlecalendars/GoogleCalendarsCalendarListTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/googlecalendars/GoogleCalendarsEventListTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/googlecalendars/GoogleCalendarsEventTranslator' ));
	}

	if( !options.services || options.services.indexOf( 'imap' ) >= 0 )
	{
		this.fetcher.registerTranslator( require( './lib/translators/imap/ImapUserProfileTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/imap/ImapMailboxListTranslator' ));
		this.fetcher.registerTranslator( require( './lib/translators/imap/ImapMailboxContentsTranslator' ) );
		this.fetcher.registerTranslator( require( './lib/translators/imap/ImapMessageTranslator' ) );
	}

	if( !options.services || options.services.indexOf( 'gmail' ) >= 0 )
	{
		//this.fetcher.registerTranslator( require( './lib/translators/gmail/GMailUserProfileTranslator' ));
	}
}

module.exports = exports = {
	DataModule: EngineDataModule,
	DummyTokenStore: require( './lib/DummyTokenStore' )
}