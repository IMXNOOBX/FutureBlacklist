module.exports = {
    name: 'faq',
    description: 'Frequently asked question.',
    run: async (client, interaction) => {
        await interaction.followUp({ content: client.config.loading }).then(msg => { setTimeout(() => msg.delete(), 3000) }).catch(); // not ephemeral cause defered
       
        let embed = new client.discord.EmbedBuilder()
        .setColor("#54FF5C")
        .setTitle("Future BL | FAQ")
        .setThumbnail(client.config.banner)
        .setDescription(`Frequently asked questions.`)
        .addFields(
            { name: '**What is FutureDB**', value: `This project is a gta5 player database. Its main pourpose is to blacklist modders and spammers.`, inline: false },
            { name: '**Whitelist**', value: `The only people that are whitelisted in the database are mainly the ones that collect the data. We think that risking their accounts for the project is enough reason to be whitelisted. We also whitelist people who are known in the community (streamers, youtubers... ) as their public profile could lead to many people abusing this project with bad intentions.`, inline: false },
            { name: '**Why**', value: `The modding community has grown a lot in gta and we wanted to make a database to investigate those statistics.`, inline: false },
            { name: '**Donations**', value: `Yes, we will be accepting donations to keep this project up as long as posible, hosting, dns... arent cheap. You also will be rewarded by donating.`, inline: false },
            // { name: '**Advertiser Players**', value: `**${advertisers['COUNT(*)']}**`, inline: true },
            { name: '**Discord**', value: `Yes, click **[here](https://discord.gg/eJH2hVGSKz)** to get access.`, inline: false }
        )
    await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: false }); // ephemeral
    }
}
