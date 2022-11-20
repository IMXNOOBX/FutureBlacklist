const Discord = require('discord.js');
const { Webhook } = require('dis-logs');

// const fs = require('fs');
var mysql = require('mysql');
const auth = require('dotenv').config()
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        // Discord.GatewayIntentBits.GuildMembers,
        // Discord.GatewayIntentBits.GuildMessages,
        // Discord.GatewayIntentBits.GuildWebhooks,
        // Discord.GatewayIntentBits.DirectMessages
    ],
    //partials: [
    //    Discord.Partials.Channel, // Required to receive DMs
    //]
});

// var con = mysql.createConnection({
//     host: config.db.host,
//     user: config.db.user,
//     password: config.db.password,
//     database: config.db.database,
// });

// client.con = con;
client.ms = require('ms');
client.config = require('./conf/config.json'); // Same with all of these
client.log = new Webhook(client.config.utils.log_webhook);

client.discord = Discord;
client.commands = new Discord.Collection();
client.commands.normal = new Discord.Collection();
client.events = new Discord.Collection();
client.commands.normal.aliases = new Discord.Collection();
client.commands.buttons = new Discord.Collection();
client.commands.menus = new Discord.Collection();
client.commands.slash = new Discord.Collection();


// Creating Command Handler Handler
var hands = ['hEvents', 'hSlash'];
hands.forEach(handler => {
    require(`./handler/${handler}`)(client);
});

client.login(process.env.BOT_TOKEN).catch(err => {
    client.log.error('[BOT] | Login Error. Discord Response: ' + err);
});