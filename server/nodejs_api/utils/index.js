module.exports = function (app) {
	var db = app.get('db')
	var database_stats = app.get('stats')

	function updateValues() {
		console.log(`[debug] - Updating database stats.`)
		db.query(`SELECT COUNT(*) FROM PLAYERS;`, function (response, message) {
			database_stats.total_players = response[0]['COUNT(*)']
		});
		db.query(`SELECT COUNT(*) FROM PLAYERS WHERE modder=1;`, function (response, message) {
			database_stats.modder_players = response[0]['COUNT(*)']
		});
		db.query(`SELECT COUNT(*) FROM PLAYERS WHERE advertiser=1;`, function (response, message) {
			database_stats.advertiser_players = response[0]['COUNT(*)']
		});

		setTimeout(function() {
			database_stats.legit_players = database_stats.total_players - (database_stats.modder_players + database_stats.advertiser_players)
		}, 3000); // 100-200ms is ok but if the database is slow it will give error before doing the maths wrong
	}

	app.get('schedule').scheduleJob('1 * * * *', function () {  // this for one hour: https://crontab.guru/every-1-hour
		updateValues()
	});
	updateValues()
};