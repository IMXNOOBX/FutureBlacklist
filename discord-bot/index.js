const Discord = require('discord.js');
const { Webhook } = require('dis-logs');
const config = require('./conf/config.json');

// const fs = require('fs');
var mysql = require('mysql');
const auth = require('dotenv').config()
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
    ],
});

var con = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
});

client.con = con;
client.crypto = require("crypto");
client.ms = require('ms');
client.schedule = require('node-schedule');
client.axios = require('axios');
client.config = config; 
client.log = new Webhook(client.config.utils.log_webhook);

client.discord = Discord;
client.commands = new Discord.Collection();
client.commands.normal = new Discord.Collection();
client.events = new Discord.Collection();
client.commands.normal.aliases = new Discord.Collection();
client.commands.buttons = new Discord.Collection();
client.commands.menus = new Discord.Collection();
client.commands.slash = new Discord.Collection();
require('./utils')(client);


// Creating Command Handler Handler
var hands = ['hEvents', 'hSlash'];
hands.forEach(handler => {
    require(`./handler/${handler}`)(client);
});

client.login(process.env.BOT_TOKEN).catch(err => {
    client.log.error('[BOT] | Login Error. Discord Response: ' + err);
});