module.exports = function (client) {


	function sendStatsData() {
		client.axios.get('https://gtaapi.imxnoobx.com/api/v1/stats').then(async (resp) => {
			if (!resp) return; resp = resp.data
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

			const channel = await client.channels.cache.get(client.config.stats_channel)
			if (!channel) return client.log.console('Error finding stats channel, please fix.')
			channel.send({  
				embeds: [embed]
			})
		});
	}

	client.schedule.scheduleJob('0 0 * * *', function () {  // https://crontab.guru/#0_0_*_*_*
		sendStatsData()
	});
	setTimeout(sendStatsData, 5000) // wait for the bot to load up
};