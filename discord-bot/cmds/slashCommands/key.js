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
		await interaction.followUp({ content: '🌌 - Searching in the internet galaxy for your request...'}); // not ephemeral cause defered

		if(!key_user || !key_check || !key_disable) {
			let embed = new client.discord.EmbedBuilder()
				.setColor("#FF0000")
				.setDescription(`No option selected, Try again`)
			await interaction.followUp({ content: 'Error :c', embeds: [embed], ephemeral: true}); // ephemeral
		}

    }
}