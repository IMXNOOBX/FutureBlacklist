module.exports = {
    name: 'ping',
    description: 'Check the ping of the bot.',
    run: async (client, interaction) => {
        await interaction.followUp({ content: client.config.loading }).then(msg => { setTimeout(() => msg.delete(), 3000) }).catch(); // not ephemeral cause defered
       
        let embed = new client.discord.EmbedBuilder()
            .setColor("#36393F")
            .setDescription('⚡ pong: '+ client.ws.ping  +'ms')
        return await interaction.followUp({ content: 'Success!', embeds: [embed], ephemeral: false });
    }
}
