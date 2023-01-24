module.exports = function (app) {
	var db = app.get('db')
	var database_stats = app.get('stats')

	function updateValues() {
		db.query(`SELECT COUNT(*) FROM PLAYERS;`, function (error, total, fields) {
			database_stats.total_players = total[0]['COUNT(*)']
		});
		db.query(`SELECT COUNT(*) FROM PLAYERS WHERE modder=1;`, function (error, modders, fields) {
			database_stats.modder_players = modders[0]['COUNT(*)']
		});
		db.query(`SELECT COUNT(*) FROM PLAYERS WHERE advertiser=1;`, function (error, advertiser, fields) {
			database_stats.advertiser_players = advertiser[0]['COUNT(*)']
			database_stats.legit_players = database_stats.total_players - (database_stats.modder_players + database_stats.advertiser_players)
		});
	}

	app.get('schedule').scheduleJob('1 * * * *', function () {  // this for one hour: https://crontab.guru/every-1-hour
		updateValues()
	});
	updateValues()
};