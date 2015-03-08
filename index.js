var Steam = require('steam');
var fs = require('fs');
var cfg = require('./cfg/config.js');

/* Authentication */
// Setup login and password
var credentials = {
	accountName: cfg.STEAM_LOGIN,
	password: cfg.STEAM_PASSWORD
};

// Setup steam Sentry authcode (one-time code emailed to you) if SteamGuard is used
if(cfg.STEAM_AUTHCODE) {
	credentials['authCode'] = cfg.STEAM_AUTHCODE;
}


var sentryPath = '.shaSentry';

// Setup steam Sentry buffer (passcode for account) if SteamGuard is used
if(fs.existsSync(sentryPath)) {
	credentials['shaSentryfile'] = fs.readFileSync(sentryPath);
}

console.log(credentials);
/* List of friends */
// Must be numeric ID's
// To get numeric ID's via username, visit: http://steamrep.com/search?q=USER_NAME
// e.g. http://steamrep.com/search?q=bdickason

var steamFriends = [
	'76561197996626069',	// Larry_Manalo
	'76561197962411327'	// bdickason
];


/* Initiate connection to Steam */

var bot = new Steam.SteamClient();

bot.logOff();
// Log in with credentials specified in config file
bot.logOn(credentials);

bot.on('loggedOn', function() {


	// List of fields to grab
	var requestedFields = 
		Steam.EClientPersonaStateFlag.Status
		|
		Steam.EClientPersonaStateFlag.PlayerName
		|
		Steam.EClientPersonaStateFlag.Presence
		|
		Steam.EClientPersonaStateFlag.SourceID
		|
	  	Steam.EClientPersonaStateFlag.GameExtraInfo
	  	|
	  	Steam.EClientPersonaStateFlag.GameDataBlob;

	// Get friends' data	  	
	bot.requestFriendData(steamFriends, requestedFields);
});

bot.on('user', function(userData) {
	console.log(userData);
});

bot.on('fromGC', function(appID, type, body, args) {
	console.log("Message received from GC");
	console.log(appID);
	console.log(type);
	console.log(body);
	console.log(args);
});

// If user has SteamGuard - Used to get a 'shaSentryfile' which allows us to login without entering a access code every time
bot.on('sentry', function(sha) {
	// We don't have a sentry sha, let's store it.
	var path = sentryPath;

	fs.open(path, 'w', function(err, fd) {
		if(err) {
			throw 'error opening file: ' + err;
		}
		else {
			fs.write(fd, sha, 0, sha.length, null, function(err) {
				if (err) {
					throw 'error writing file: ' + err;
				}
				else {
					fs.close(fd, function() {
						console.log('sha saved, you can now login');
					});
				}
			});
		}
	});
});