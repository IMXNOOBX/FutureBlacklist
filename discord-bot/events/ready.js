module.exports.run = async (client) => {
  client.log.console(
    `[BOT] | Username: ${client.user.tag} | Guilds: ${client.guilds.cache.size} servers | Users: ${client.users.cache.size} total users`
  );
  client.user.setStatus("dnd"); // online, idle, dnd, invisible
  const statuses = [
    `${client.guilds.cache.size} Guilds`,
    `${client.users.cache.size} Users`,
    `github.com/IMXNOOBX`,
  ];
  client.user.setActivity("Starting bot...", { type: client.discord.ActivityType.Competing }); // 
  setInterval(() => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]; 
    client.user.setActivity(status, { type: client.discord.ActivityType.Watching }); // 
  }, 60000);
};
