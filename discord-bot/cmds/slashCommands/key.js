module.exports = {
    name: 'key',
    description: 'API Key system related commands.',
    options: [
        {
            name: "generate",
            description: "Generate an API key for a user.",
            type: 6, //User
            required: false
        }, 
		{
            name: "check",
            description: "Check if a key exist, is disabled, information...",
            type: 3, //String
            required: false
        }, 
		{
            name: "disable",
            description: "Disable a key, in the API",
            type: 5, //Boolean
            required: false
        }, 
		// {
        //     name: "list",
        //     description: "Get a list with all the API keys and users",
        //     required: false
        // }
    ],
    run: async (client, interaction, args) => {
		const key_user = interaction.options.getUser('generate');
		const key_check = interaction.options.getString('check');
		const key_disable = interaction.options.getBoolean('diable');
        await interaction.followUp({ content: client.config.loading }).then(msg => { setTimeout(() => msg.delete(), 3000)}).catch(); // not ephemeral cause defered
        if (interaction.user.id !== client.config.dev.owner_id) {
            return;
        }

		if(!key_user && !key_check && !key_disable) {
			let embed = new client.discord.EmbedBuilder()
				.setColor("#FF0000")
				.setDescription(`No option selected, Try again`)
			await interaction.followUp({ content: 'Error :c', embeds: [embed], ephemeral: true}); // ephemeral
		}

        if (key_user && key_user?.id) {
            var key = client.crypto.randomBytes(20).toString('hex').toUpperCase();
            console.log(key, key_user.username, key_user.id)
            client.con.query(`INSERT INTO USER (key_auth, name, discord_id) VALUES (${key}, ${key_user.username}, ${key_user.id});`, async function (error, results, fields) {
                if (error) throw error;
                let embed = new client.discord.EmbedBuilder()
                    .setColor("#54FF5C")
                    .setTitle('Succesfully created new user!')
                    .setDescription(`No option selected, Try again`)
                    .addFields(
                        { name: '**Username**', value: `**__${key_user.username}__**`, inline: true },
                        { name: '**User ID**', value: `**__${key_user.id}__**`, inline: true },
                        { name: '\u200B', value: '\u200B' },
                        { name: '**Key**', value: `||**${key}**||`, inline: true }
                    )
                await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: true}); 
            });
        }

    }
}