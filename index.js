var Steam = require('steam');
var fs = require('fs');
var cfg = require('./cfg/config.js');

// Setup login and password
var credentials = {
	accountName: cfg.STEAM_LOGIN,
	password: cfg.STEAM_PASSWORD
};

var sentryPath = '.shaSentry';

// Setup steam Sentry buffer (passcode for account)
if(fs.existsSync(sentryPath)) {
	credentials['shaSentryfile'] = fs.readFileSync(sentryPath);
}

var bot = new Steam.SteamClient();

// Log in with credentials specified in config file
bot.logOn(credentials);

bot.on('loggedOn', function() {
	console.log('Logged in!');
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