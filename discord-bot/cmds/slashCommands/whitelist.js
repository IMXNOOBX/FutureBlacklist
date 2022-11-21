const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'whitelist',
    description: 'Fetch information about players.',
    options: [
        {
            name: "enable",
            description: "Enable/Disable whitelist in target player.",
            type: 5, // Boolean
            required: true
        },
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
    ],
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    run: async (client, interaction, args) => {
        const search_rid = interaction.options.getString('rid');
        const search_name = interaction.options.getString('name');
        const option = interaction.options.getBoolean('enable');
       
        await interaction.followUp({ content: client.config.loading }).then(msg => { setTimeout(() => msg.delete(), 3000) }).catch(); // not ephemeral cause defered
       
        if (interaction.user.id !== client.config.dev.owner_id) {
            return;
        }

        if (!search_rid && !search_name) {
            let embed = new client.discord.EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`No option selected, Try again`)
            await interaction.followUp({ content: 'Error :c', embeds: [embed], ephemeral: true }); // ephemeral
        }

        client.con.query(search_rid ? `SELECT rid FROM PLAYERS WHERE rid=${search_rid}` : `SELECT rid FROM PLAYERS WHERE name='${search_name}'`, async function (error, results, fields) {
            if (results?.length == 0) { // check if user exist
                let embed = new client.discord.EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle('Error whitelisting user!')
                    .addFields(
                        { name: '**Error**', value: 'User doesn\'t exists!', inline: true },
                    )
                return await interaction.followUp({ content: 'Error!', embeds: [embed], ephemeral: true });
            }

            results = results[0]

            client.con.query(`UPDATE PLAYERS SET whitelist='${option ? 1 : 0}' WHERE rid='${results.rid}'`, async function (error, res, fields) {
                if (error) {
                    console.log(error)
                    let embed = new client.discord.EmbedBuilder()
                        .setColor("#FF0000")
                        .setTitle('__Error disabling/enabling whitelist!__')
                        .addFields(
                            { name: '**Error**', value: error, inline: true },
                        )
                    return await interaction.followUp({ content: 'Error!', embeds: [embed], ephemeral: true });
                };
                let embed = new client.discord.EmbedBuilder()
                .setColor("#54FF5C")
                    .setTitle(`Successfully ${option ? "whitlisted" : "removed from whitelist selected"} user!`)
                    .addFields(
                        { name: '**SCID**', value: `__\`${results.rid}\`__ is now whitelisted.`, inline: true },
                    )
                return await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: true });
            });
        });

    }
}