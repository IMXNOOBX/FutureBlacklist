const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'key',
    description: 'API Key system related commands.',
    options: [
        {
            name: "generate",
            description: "Generate an API key for a user.",
            type: 6, // User
            required: false
        },
        {
            name: "check",
            description: "Check if a key exist, is disabled, information...",
            type: 3, // String
            required: false
        },
        {
            name: "toggle",
            description: "Disable/Enable a key, in the API",
            type: 3, // String
            required: false
        },
    ],
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    run: async (client, interaction, args) => {
        const key_user = interaction.options.getUser('generate');
        const key_check = interaction.options.getString('check');
        const key_disable = interaction.options.getString('toggle');
        
        await interaction.followUp({ content: client.config.loading }).then(msg => { setTimeout(() => msg.delete(), 3000) }).catch(); // not ephemeral cause defered
        
        if (interaction.user.id !== client.config.dev.owner_id) {
            return;
        }

        if (!key_user && !key_check && !key_disable) {
            let embed = new client.discord.EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`No option selected, Try again`)
            await interaction.followUp({ content: 'Error :c', embeds: [embed], ephemeral: true }); // ephemeral
        }

        if (key_user && key_user?.id) {
            var key = client.crypto.randomBytes(20).toString('hex').toUpperCase();

            client.con.query(`SELECT discord_id FROM USER WHERE discord_id='${key_user.id}' LIMIT 0, 1`, async function (error, results, fields) {
                if (results?.length !== 0) { // check if user exist
                    let embed = new client.discord.EmbedBuilder()
                        .setColor("#FF0000")
                        .setTitle('Error creating new user!')
                        .addFields(
                            { name: '**Error**', value: 'User already exists!', inline: true },
                        )
                    return await interaction.followUp({ content: 'Error!', embeds: [embed], ephemeral: true });
                }

                client.con.query(`INSERT INTO USER (key_auth, name, discord_id) VALUES ('${key}', '${key_user.username}', '${key_user.id}');`, async function (error, results, fields) {
                    if (error) {
                        console.log(error)
                        let embed = new client.discord.EmbedBuilder()
                            .setColor("#FF0000")
                            .setTitle('__Error creating new user!__')
                            .addFields(
                                { name: '**Error**', value: error, inline: true },
                            )
                        return await interaction.followUp({ content: 'Error!', embeds: [embed], ephemeral: true });
                    };
                    let embed = new client.discord.EmbedBuilder()
                        .setColor("#54FF5C")
                        .setTitle('Succesfully created new user!')
                        .addFields(
                            { name: '**Username**', value: `**__\`${key_user.username}\`__**`, inline: true },
                            { name: '**User ID**', value: `**__\`${key_user.id}\`__**`, inline: true },
                            { name: '\u200B', value: '\u200B', inline: true },
                            { name: '**Key**', value: `||**\`${key}\`**||`, inline: true }
                        )
                    return await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: true });
                });
            });

        }
        else if (key_check) {
            client.con.query(`SELECT * FROM USER WHERE key_auth='${key_check}' LIMIT 0, 1`, async function (error, results, fields) {
                if (results?.length == 0) { // check if user exist
                    let embed = new client.discord.EmbedBuilder()
                        .setColor("#FF0000")
                        .setTitle('Error geting user!')
                        .addFields(
                            { name: '**Error**', value: '__Does the user exist?__', inline: true },
                        )
                    return await interaction.followUp({ content: 'Error!', embeds: [embed], ephemeral: true });
                }
                results = results[0]
                let embed = new client.discord.EmbedBuilder()
                    .setColor("#54FF5C")
                    .setTitle('Succesfully retrieved user info!')
                    .addFields(
                        { name: '**Username**', value: `**__\`${results.name}\`__**`, inline: true },
                        { name: '**User ID**', value: `**__\`${results.discord_id}\`__**`, inline: true },
                        { name: '\u200B', value: '\u200B', inline: true },
                        { name: '**Key**', value: `||**\`${results.key_auth}\`**||`, inline: true },
                        { name: '**Last IP**', value: `||**\`${results.ip}\`**||`, inline: true }
                    )
                return await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: true });
            });
        }
        else if (key_disable) { // MJWHY5BKGYBIO2RCU7CB_DISABLED
            let key_found = false
            for (let i = 0; i < 2; i++) {
                await client.con.query(`SELECT * FROM USER WHERE key_auth='${i == 1 ? (key_disable + '_DISABLED') : key_disable}' LIMIT 0, 1`, async function (error, results, fields) {
                    if (results?.length == 0) { // check if user exist
                        return;
                    } 
                    
                    results = results[0]
                    let key_mod = results.key_auth;
                    let disabled = false
                    if (results.key_auth.includes('_DISABLED')) {
                        key_mod = key_mod.replace("_DISABLED", "")
                        disabled = false
                    } else {
                        key_mod += '_DISABLED'
                        disabled = true
                    }

                    client.con.query(`UPDATE USER SET key_auth='${key_mod}' WHERE key_auth='${results.key_auth}'`, async function (error, res, fields) {
                        if (error) {
                            console.log(error)
                            let embed = new client.discord.EmbedBuilder()
                                .setColor("#FF0000")
                                .setTitle('__Error disabling/enabling user!__')
                                .addFields(
                                    { name: '**Error**', value: error, inline: true },
                                )
                            return await interaction.followUp({ content: 'Error!', embeds: [embed], ephemeral: true });
                        };
                        key_found = true
                        let embed = new client.discord.EmbedBuilder()
                            .setColor("#54FF5C")
                            .setDescription(`Successfully **${disabled ? 'disabled' : 'enabled'}** user **${results.name}**!`)
                        return await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: true });
                    });
                    // if (!key_found && i == 1) { // async
                    //     let embed = new client.discord.EmbedBuilder()
                    //         .setColor("#FF0000")
                    //         .setTitle('Error geting user!')
                    //         .addFields(
                    //             { name: '**Error**', value: '__Does the user exist?__', inline: true },
                    //         )
                    //     return await interaction.followUp({ content: 'Error!', embeds: [embed], ephemeral: true });
                    // }
                });
            }
        }

    }
}