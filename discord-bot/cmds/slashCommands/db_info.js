module.exports = {
    name: 'database',
    description: 'Fetch information about the database.',
    run: async (client, interaction, args) => {
        await interaction.followUp({ content: client.config.loading }).then(msg => { setTimeout(() => msg.delete(), 3000) }).catch(); // not ephemeral cause defered
        client.con.query(`SELECT COUNT(*) FROM PLAYERS;`, async function (error, db, fields) {
            client.con.query(`SELECT COUNT(*) FROM PLAYERS WHERE modder=1;`, async function (error, modders, fields) {
                client.con.query(`SELECT COUNT(*) FROM PLAYERS WHERE advertiser=1;`, async function (error, advertisers, fields) {
                    if (db?.length == 0 || modders?.length == 0 || advertisers?.length == 0) {
                        let embed = new client.discord.EmbedBuilder()
                            .setColor("#FF0000")
                            .setDescription(`Error retriving data the database.`)
                        return await interaction.followUp({ content: 'Error :c', embeds: [embed], ephemeral: true }); // ephemeral
                    }

                    db = db[0]
                    modders = modders[0]
                    advertisers = advertisers[0]

                    let embed = new client.discord.EmbedBuilder()
                        .setColor("#54FF5C")
                        .setDescription(`Succesfully retrieved data from the database.`)
                        .addFields(
                            { name: '**Total Ammount of players**', value: `**${db['COUNT(*)']}**`, inline: false },
                            { name: '**Legit Players**', value: `**${(db['COUNT(*)'] - (modders['COUNT(*)'] + advertisers['COUNT(*)']))}**`, inline: false },
                            { name: '**Modder Players**', value: `**${modders['COUNT(*)']}**`, inline: true },
                            { name: '**Advertiser Players**', value: `**${advertisers['COUNT(*)']}**`, inline: true },
                            { name: '**Database Created**', value: `**<t:1668250837:R>**`, inline: false }
                        )
        
                    await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: true }); // ephemeral
                });
            });
        });
    }
}