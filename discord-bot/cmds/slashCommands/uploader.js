const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'uploader',
    description: 'Check the stats of a uploader.',
    options: [
        {
            name: "user",
            description: "Check the stats of the provided user.",
            type: 6, // User
            required: true
        }
    ],
    // defaultMemberPermissions: PermissionFlagsBits.Administrator,
    run: async (client, interaction, args) => {
        const key_user = interaction.options.getUser('user');

        await interaction.followUp({ content: client.config.loading }).then(msg => { setTimeout(() => msg.delete(), 3000) }).catch(); // not ephemeral cause defered


        if (!key_user) {
            let embed = new client.discord.EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`No option selected, Try again`)
            await interaction.followUp({ content: 'Error :c', embeds: [embed], ephemeral: true }); // ephemeral
        }

        if (key_user && key_user?.id) {
            client.con.query(`SELECT name, discord_id FROM USER WHERE discord_id='${interaction.user.id}' LIMIT 0, 1`, async function (error, results, fields) {
                if (results?.length == 0) { 
                    let embed = new client.discord.EmbedBuilder()
                        .setColor("#FF0000")
                        .addFields(
                            { name: '**Error**', value: 'You are not authorized!', inline: true },
                        )
                    return await interaction.followUp({ content: 'Error!', embeds: [embed], ephemeral: true });
                }
                client.con.query(`SELECT name, discord_id FROM USER WHERE discord_id='${key_user.id}' LIMIT 0, 1`, async function (error, results, fields) {
                    if (results?.length == 0) { // check if user exist
                        let embed = new client.discord.EmbedBuilder()
                            .setColor("#FF0000")
                            .addFields(
                                { name: '**Error**', value: 'The target user is not authorized!', inline: true },
                            )
                        return await interaction.followUp({ content: 'Error!', embeds: [embed], ephemeral: true });
                    }

                    results = results[0]

                    client.con.query(`SELECT COUNT(*) FROM PLAYERS WHERE added_by='${results.discord_id}';`, async function (error, db, fields) {
                        client.con.query(`SELECT COUNT(*) FROM PLAYERS WHERE added_by='${results.discord_id}' AND modder=1;`, async function (error, modders, fields) {
                            client.con.query(`SELECT COUNT(*) FROM PLAYERS WHERE added_by='${results.discord_id}' AND advertiser=1;`, async function (error, advertisers, fields) {
                                if (db?.length == 0 || modders?.length == 0 || advertisers?.length == 0) {
                                    let embed = new client.discord.EmbedBuilder()
                                        .setColor("#FF0000")
                                        .setDescription(`Error retriving data the database.`)
                                    return await interaction.followUp({ content: 'Error :c', embeds: [embed], ephemeral: true }); // ephemeral
                                }
                                console.log(db, modders, advertisers)
                                db = db[0]
                                modders = modders[0]
                                advertisers = advertisers[0]

                                let embed = new client.discord.EmbedBuilder()
                                    .setColor("#54FF5C")
                                    .setTitle("Future BL | Uploader Info")
                                    .setThumbnail(client.config.banner)
                                    .setDescription(`Succesfully retrieved data from the database.`)
                                    .addFields(
                                        { name: '**Scanner**', value: `**${results.name}**`, inline: true },
                                        { name: '**ID**', value: `**${results.discord_id}**`, inline: true },
                                        { name: '\u200B', value: '\u200B' },
                                        { name: '**Total Ammount of players**', value: `**${db['COUNT(*)']}**`, inline: false },
                                        { name: '**Legit Players**', value: `**${(db['COUNT(*)'] - (modders['COUNT(*)'] + advertisers['COUNT(*)']))}**`, inline: false },
                                        { name: '**Modder Players**', value: `**${modders['COUNT(*)']}**`, inline: true },
                                        { name: '**Advertiser Players**', value: `**${advertisers['COUNT(*)']}**`, inline: true },
                                    )

                                await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: true }); // ephemeral
                            });
                        });
                    });
                });
            });
        }
    }
}