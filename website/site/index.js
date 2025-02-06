const express = require('express')
const rl = require('express-rate-limit')
const mysql = require('mysql')
const cheerio = require('cheerio');
var path = require('path');
var fs = require('fs');
var schedule = require('node-schedule');
var cookieParser = require('cookie-parser')
const sqlinjection = require('sql-injection');
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

const quick_limiter = rl({
	windowMs: 1 * 1000, // 1 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, 15 minutes)
    handler: function (req, res) {
        return res.status(429).json({
          error: 'You sent too many requests. Please wait a while and then try again.'
        })
    }
})

app.use(sqlinjection);
app.use(public_limiter)
app.use(quick_limiter)
app.use(express.json())
app.use(cookieParser());

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
app.set('cookie', cookieParser);
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
app.get('/index.html', public.index);
app.get('/faq', public.faq);
app.get('/faq.html', public.faq);
app.get('/api', public.api);
app.get('/api.html', public.api);
app.get('/user/:user', public.user)
app.get('/key/:key', public.set_cookie)

// app.get('/ip', (request, response) => response.send(request.ip))

app.use(function(req, res, next) {
	res.status(404).sendFile(path.resolve('public/html/404.html'))
});

app.listen(config.port, () => {
	console.log(`[debug] - API serving at http://127.0.0.1:${config.port}`)
})