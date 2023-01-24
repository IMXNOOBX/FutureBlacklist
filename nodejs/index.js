const express = require('express')
const rl = require('express-rate-limit')
// const express = require('mysql')
const PoolManager = require('mysql-connection-pool-manager'); // https://www.npmjs.com/package/mysql-connection-pool-manager
const sqlinjection = require('sql-injection');
const config = require('./config.json')
const v0 = require("./routes/v0"),
	v1 = require('./routes/v1')
const check_key = require('./utils/key')
const user_exist = require('./utils/exist')

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

const uploader_limiter = rl({
	windowMs: 60 * 1000, // 1 minutes
	max: 150, // Limit each IP to 100 requests per `window` (here, 15 minutes)
    handler: function (req, res) {
        return res.status(429).json({
          error: 'You sent too many requests. Please wait a while and then try again.'
        })
    }
})

app.use(sqlinjection);
app.use('/api/v1', public_limiter)
app.use('/api/v0', uploader_limiter)
app.use(express.json())

// const connection = mysql.createConnection({
// 	host     : config.db.host,
// 	user     : config.db.user,
// 	password : config.db.password,
// 	database : config.db.database
//   });

const options = {
	idleCheckInterval: 1000,
	maxConnextionTimeout: 30000,
	idlePoolTimeout: 3000,
	errorLimit: 5,
	preInitDelay: 50,
	sessionTimeout: 60000,
	// onConnectionAcquire: () => { console.log("[debug] - Database Connection Acquired") },
	// onConnectionConnect: () => { console.log("[debug] - Database Connection Successed"); },
	// onConnectionEnqueue: () => { console.log("[debug] - Database Connection Enqueued"); },
	// onConnectionRelease: () => { console.log("[debug] - Database Connection Released"); },
	mySQLSettings: {
		host: config.db.host,
		user: config.db.user,
		password: config.db.password,
		database: config.db.database,
		port: '3306',
		socketPath: '/tmp/mysql.sock', // /var/run/mysqld/mysqld.sock
		charset: 'utf8',
		multipleStatements: true,
		connectTimeout: 15000,
		acquireTimeout: 10000,
		waitForConnections: true,
		connectionLimit: 1000,
		queueLimit: 5000,
		debug: false
	}
}

const db = PoolManager(options);

app.set('db', db);
app.set('stats', {});
app.set('config', config);
app.set('check_key', check_key);
app.set('user_exist', user_exist);
app.set('trust proxy', 2); //https://github.com/express-rate-limit/express-rate-limit/issues/165

db.query("CREATE TABLE IF NOT EXISTS PLAYERS (rid INTEGER NOT NULL PRIMARY KEY, name TEXT, ip TEXT, note TEXT, modder INTEGER DEFAULT 0, advertiser INTEGER DEFAULT 0, risk INTEGER DEFAULT 0, whitelist INTEGER DEFAULT 0, times_seen INTEGER DEFAULT 0, last_seen TEXT, first_seen TEXT, added_by TEXT NOT NULL)", (res, msg) => {
	// console.log(res,msg);
});
db.query("CREATE TABLE IF NOT EXISTS USER (key_auth VARCHAR(50) NOT NULL PRIMARY KEY,name TEXT,discord_id TEXT NOT NULL,ip TEXT)", (res, msg) => {
	// console.log(res, msg);
});

app.get('/', (req, res) => {
    res.send({
		endpoints: {
			"v1_get_user": "/api/v1/user/<rid>",
			"v1_user_exists": "/api/v1/users/exist/<rid>",
        },
		success: true
    })
})

if(config.debug)
	app.use(function(req, res, next) {
		console.log(`${req.ip} | ${req.originalUrl}`)
		next()
	});


// app.get('/ip', (request, response) => response.send(request.ip))

app.get('/api/v1/stats', v1.stats)
app.get('/api/v1/user/:rid', v1.get_user)
app.get('/api/v1/user/exist/:rid', v1.exist)

app.get('/api/v0/insert', v0.insert)
app.get('/api/v0/user/:rid', v0.get_user)

app.use(function(req, res, next) {
    res.status(404).send({
        message: `Invalid endpoint.`,
		success: false
    });
});



app.listen(config.port, () => {
	console.log(`[debug] - API serving at http://127.0.0.1:${config.port}`)
})