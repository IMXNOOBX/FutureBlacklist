module.exports = {
    name: 'player',
    description: 'Fetch information about players.',
    options: [
        {
            name: "rid",
            description: "Fetch a player by his Social Club ID.",
            type: 3, // String
            required: false
        },
        {
            name: "name",
            description: "Fetch a player by his Social Club Name.",
            type: 3, // String
            required: false
        },
        // {
        //     name: "random",
        //     description: "Fetch a random player.",
        //     type: 5, // Boolean
        //     required: false
        // },
    ],
    run: async (client, interaction, args) => {
        const search_rid = interaction.options.getString('rid');
        const search_name = interaction.options.getString('name');
        // const search_rand = interaction.options.getString('random');
       
        await interaction.followUp({ content: client.config.loading }).then(msg => { setTimeout(() => msg.delete(), 3000) }).catch(); // not ephemeral cause defered
       

        if (!search_rid && !search_name && !search_rand) {
            let embed = new client.discord.EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`No option selected, Try again`)
            await interaction.followUp({ content: 'Error :c', embeds: [embed], ephemeral: true }); // ephemeral
        }

        if(search_rid) {
            client.con.query(`SELECT * FROM PLAYERS WHERE rid=${search_rid}`, async function (error, results, fields) {
                if (results?.length == 0 || results[0].whitelist == 1) {
                    let embed = new client.discord.EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(`Player doesnt exist in the database.`)
                    return await interaction.followUp({ content: 'Error :c', embeds: [embed], ephemeral: true }); // ephemeral
                }
                results = results[0]

                let embed = new client.discord.EmbedBuilder()
                    .setColor("#54FF5C")
                    .setDescription(`Succesfully retrieved data from the database.`)
                    .addFields(
                        { name: '**SCID**', value: `__\`${results.rid}\`__`, inline: true },
                        { name: '**SC Name**', value: `\`${results.name}\``, inline: true },
                        // { name: '\u200B', value: '\u200B', inline: false },
                        { name: '**Note**', value: `${results.note}`, inline: false },
                        // { name: '\u200B', value: '\u200B', inline: false },
                        { name: '**Modder**', value: `**${results.modder == 1 ? true : false}**`, inline: true },
                        { name: '**Advertiser**', value: `**${results.advertiser == 1 ? true : false}**`, inline: true },
                        { name: '**Last Seen**', value: `**${Date(results.last_seen)}**`, inline: false },
                        { name: '**First Seen**', value: `**${Date(results.first_seen)}**`, inline: false }
                    )

                await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: true }); // ephemeral
            });
        } else if(search_name) {
            client.con.query(`SELECT * FROM PLAYERS WHERE name='${search_name}'`, async function (error, results, fields) {
                if (results?.length == 0 || results[0].whitelist == 1) {
                    let embed = new client.discord.EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(`Player doesnt exist in the database.`)
                    return await interaction.followUp({ content: 'Error :c', embeds: [embed], ephemeral: true }); // ephemeral
                }
                results = results[0]

                let embed = new client.discord.EmbedBuilder()
                    .setColor(results.modder == 1 || results.advertiser == 1 ? "#FF730B" :"#54FF5C")
                    .setDescription(`Succesfully retrieved data from the database.`)
                    .addFields(
                        { name: '**SCID**', value: `__\`${results.rid}\`__`, inline: true },
                        { name: '**SC Name**', value: `\`${results.name}\``, inline: true },
                        // { name: '\u200B', value: '\u200B', inline: false },
                        { name: '**Note**', value: `${results.note}`, inline: false },
                        // { name: '\u200B', value: '\u200B', inline: false },
                        { name: '**Modder**', value: `**${results.modder == 1 ? true : false}**`, inline: true },
                        { name: '**Advertiser**', value: `**${results.advertiser == 1 ? true : false}**`, inline: true },
                        { name: '**Last Seen**', value: `**${Date(results.last_seen)}**`, inline: false },
                        { name: '**First Seen**', value: `**${Date(results.first_seen)}**`, inline: false }
                    )

                await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: true }); // ephemeral
            });
        }   // else if(search_rand) {
            //
            // }
    }
}