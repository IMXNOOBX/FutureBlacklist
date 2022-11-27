const express = require('express')
const rl = require('express-rate-limit')
const mysql = require('mysql')
const cheerio = require('cheerio');
var path = require('path');
var fs = require('fs');
var schedule = require('node-schedule');
// const PoolManager = require('mysql-connection-pool-manager'); // https://www.npmjs.com/package/mysql-connection-pool-manager
const config = require('./config.json')
const public = require("./routes/public")
var database_stats = {
	total_players: 0,
	legit_players: 0,
	modder_players: 0,
	advertiser_players: 0,
}

const app = express()

const public_limiter = rl({
	windowMs: 60 * 1000, // 1 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, 15 minutes)
    handler: function (req, res) {
        return res.status(429).json({
          error: 'You sent too many requests. Please wait a while and then try again.'
        })
    }
})

app.use(public_limiter)
app.use(express.json())

const db = mysql.createConnection({
	host     : config.db.host,
	user     : config.db.user,
	password : config.db.password,
	database : config.db.database
});

app.set('db', db);
app.set('db_stats', database_stats);
app.set('cheerio', cheerio);
app.set('config', config);
app.set('path', path);
app.set('fs', fs);
app.set('schedule', schedule);
app.set('trust proxy', 2); //https://github.com/express-rate-limit/express-rate-limit/issues/165
app.use(express.static("public")); // https://stackoverflow.com/a/38757303/15384495
require('./utils')(app);

// console.log(database_stats)

if(config.debug)
	app.use(function(req, res, next) {
		console.log(`${req.ip} | ${req.originalUrl}`)
		next()
	});


app.get('/', public.index);
app.get('/user/:user', public.user)

// app.get('/ip', (request, response) => response.send(request.ip))

app.use(function(req, res, next) {
    // res.status(404).send({
    //     message: `Invalid endpoint.`,
	// 	success: false
    // });
	res.status(404).sendFile(path.resolve('public/html/404.html'))
});

app.listen(config.port, () => {
	console.log(`[debug] - API serving at http://127.0.0.1:${config.port}`)
})