module.exports = async function(app) {
	var db = app.get('db')
	var database_stats = app.get('db_stats')

	function updateValues() {
		// db.query(`SELECT COUNT(*) FROM PLAYERS;`, function (error, total, fields) {
		// 	database_stats.total_players = total[0]['COUNT(*)']
		// });
		// db.query(`SELECT COUNT(*) FROM PLAYERS WHERE modder=1;`, function (error, modders, fields) {
		// 	database_stats.modder_players = modders[0]['COUNT(*)']
		// });
		// db.query(`SELECT COUNT(*) FROM PLAYERS WHERE advertiser=1;`, function (error, advertiser, fields) {
		// 	database_stats.advertiser_players = advertiser[0]['COUNT(*)']
		// });
		database_stats.total_players = 1000;
		database_stats.modder_players = 10; 
		database_stats.advertiser_players = 50;
		database_stats.legit_players = database_stats.total_players - (database_stats.modder_players + database_stats.advertiser_players)
		// console.log(database_stats)
	}

	app.get('schedule').scheduleJob('1 * * * *', function () {  // this for one hour: https://crontab.guru/every-1-hour
		// console.log('[Cron] | 1 min has passed');
		updateValues()
	});
	updateValues()
	// console.log(database_stats)
};