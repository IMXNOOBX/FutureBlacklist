module.exports = function (client) {


	function sendStatsData() {
		client.axios.get('https://api.futuredb.shop/api/v1/stats').then(resp => {
			if (!resp) return;
			if (!resp.success) return;

			let embed = new client.discord.EmbedBuilder()
				.setColor("#54FF5C")
				.setDescription(`Database stats from ${new Date().toISOString().slice(0, 10)}`)
				.addFields(
					{ name: '**Total Ammount of players**', value: `**${resp.data.total_players}**`, inline: false },
					{ name: '**Legit Players**', value: `**${resp.data.legit_players}**`, inline: false },
					{ name: '**Modder Players**', value: `**${resp.data.modders}**`, inline: true },
					{ name: '**Advertiser Players**', value: `**${resp.data.advertisers}**`, inline: true },
				)

			client.channels.fetch(client.config.stats_channel).send({  
				embeds: [embed]
			})
		});
	}

	client.schedule.scheduleJob('0 0 * * *', function () {  // https://crontab.guru/#0_0_*_*_*
		sendStatsData()
	});
	sendStatsData()
};