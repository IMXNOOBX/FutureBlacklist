import datetime
import json
import sys
import threading
from http import HTTPStatus

from flask import Flask, jsonify, request
# https://flask-limiter.readthedocs.io/en/stable/
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
#from flask_mysqldb import MySQL
from flaskext.mysql import MySQL

app = Flask(__name__)

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["5000 per hour", "100/minute", "2/second"],
    storage_uri="memory://",
)

lock = threading.Lock()

app.config['MYSQL_DATABASE_HOST'] = '127.0.0.1'
app.config['MYSQL_DATABASE_USER'] = 'Future5'
app.config['MYSQL_DATABASE_PASSWORD'] = 'GNB82hBjtA54P8ey'
app.config['MYSQL_DATABASE_DB'] = 'future5'

mysql = MySQL()
mysql.init_app(app)

con = mysql.connect()
db = con.cursor()

db.execute("CREATE TABLE IF NOT EXISTS PLAYERS (rid INTEGER NOT NULL PRIMARY KEY, name TEXT, ip TEXT, note TEXT, modder INTEGER DEFAULT 0, advertiser INTEGER DEFAULT 0, risk INTEGER DEFAULT 0, whitelist INTEGER DEFAULT 0, times_seen INTEGER DEFAULT 0, last_seen DATE, first_seen DATE, added_by TEXT NOT NULL)")
db.execute("CREATE TABLE IF NOT EXISTS USER (key_auth VARCHAR(50) NOT NULL PRIMARY KEY,name TEXT,discord_id TEXT NOT NULL,ip TEXT)")


@app.route('/')
def index():
    return jsonify({'success': True,
                    'endpoints': {
                        "v1_get_user": "/api/v1/user/<rid>",
                        "v1_user_exists": "/api/v1/users/exist/<rid>",
                        # "v0_add_user_private": "/api/v0/insert?key=<key>&rid=<rid>&name=<name>&ip=<ip>&note=<note>&modder=<modder>&risk=<risk>
                        # "v0_get_user": "/api/v0/user/<rid>",
                    }})


def check_if_exists(rid):
    if (not rid.isdigit()):
        return False
    # print(rid)
    #db = mysql.connection.cursor()
    # con.ping()
    db = con.cursor()
    db.execute("SELECT * FROM PLAYERS WHERE rid=%s LIMIT 0, 1", (rid, ))
    check = db.fetchall()
    db.close()
    # print(check)
    return False if len(check) == 0 else True

def check_user_key(key):
    if (not key):
        return False
    #db = mysql.connection.cursor()
    # con.ping()
    db = con.cursor()
    db.execute(f"SELECT discord_id FROM USER WHERE key_auth='{key}' LIMIT 0, 1")
    check = db.fetchall()
    db.close()
    # print(check)
    return False if len(check) == 0 else check[0]

# http://127.0.0.1:80/api/v1/user/<rid>
@app.route('/api/v1/user/<rid>')
@limiter.limit("100/minute")
def get_user(rid):
    # try:
        # lock.acquire(True)
    #db = mysql.connection.cursor()
    con.ping()
    db = con.cursor()
    db.execute("SELECT * FROM PLAYERS WHERE rid=%s", (rid, ))
    all = db.fetchall()
    db.close()
    if(len(all) != 0):
        # print(all)
        for row in all:
            if (row[7] == 1):
                return jsonify({
                    'success': False,
                    "message": "Player doesnt exist in the database"
                })
            return jsonify({
                "data": {
                    'rokcstar_id': row[0],  # 0. rid
                    'rockstar_name': row[1],  # 1. name
                    # 'last_playerip': row[2], # 2. last_ip
                    "player_note": row[3],  # 3. note
                    # 4. is_modder
                    "is_modder": True if row[4] == 1 else False,
                    "advertiser": True if row[5] == 1 else False,
                    "risk": row[6],  # 5. risk
                    # "whitelist": True if row[7] == 1 else False, # 6. whitelist
                    # "times_seen": row[8], # 7. times_seen
                    "last_seen": row[9],  # 8. last_seen
                    "first_seen": row[10],  # 9. first_seen
                    # "added_by": row[11], # 10. added_by
                },
                'success': False,
                "message": "Succesfully retrieved data from the database"
            })
    else:
        return jsonify({
            'success': False,
            "message": "Player doesnt exist in the database"
        })
    # finally:
    #     lock.release()

# http://127.0.0.1:80/api/v1/user/exist/<rid>
@app.route('/api/v1/user/exist/<rid>')
@limiter.limit("100/minute")
def exist_user(rid):
    con.ping()
    return jsonify({
        'success': True,
        'exist': check_if_exists(rid),
    })

# http://127.0.0.1:80/api/v0/insert?key=<key>&rid=<rid>&name=<name>&ip=<ip>&note=<note>&modder=<modder>&risk=<risk>
@app.route('/api/v0/insert')
@limiter.limit("100/minute")
def add_user():
    key = str(request.args.get('key'))
    rid = request.args.get('rid')
    name = request.args.get('name')
    ip = request.args.get('ip') or "0.0.0.0"
    note = request.args.get('note') or None
    modder = 1 if (request.args.get('modder') ==
                   "1" or request.args.get('modder') == "true") else 0
    advertiser = 1 if (request.args.get('advertiser') ==
                   "1" or request.args.get('advertiser') == "true") else 0
    risk = request.args.get('risk') if (request.args.get('risk') and request.args.get(
        'risk').isdigit() and 0 <= request.args.get('risk') < 3) else 0  # range 0-2, None, Medium, High
    # request_ip = request.remote_addr
    date = datetime.datetime.now()
    con.ping()
    uploaderid = check_user_key(key)
    if (not uploaderid):  # Check uploader key
        return jsonify({
            'success': False,
        }), HTTPStatus.FORBIDDEN
    if (not rid or not name):  # Check important arguments
        return jsonify({
            'success': False,
        }), HTTPStatus.BAD_REQUEST
    #db = mysql.connection.cursor()
    db = con.cursor()
    # db.execute("UPDATE USER SET ip=%s WHERE key_auth=%s", (request_ip, key))
    if (not check_if_exists(rid)):
        values = (
            rid,
            name,
            ip,
            note,
            modder,
            advertiser,
            risk,
            date,
            date,
            uploaderid
        )
        db.execute("INSERT INTO PLAYERS (rid, name, ip, note, modder, advertiser,  risk, last_seen, first_seen, added_by) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", values)
        con.commit(); db.close()
        return jsonify({
            'success': True,
            'message': f'Added {name} successfully'
        })
    elif (modder == 1):
        db.execute("UPDATE PLAYERS SET ip=%s, times_seen = times_seen+1, last_seen=%s, note=%s, modder=%s WHERE rid=%s",
                   (ip, date, note, modder, rid))  # note=note || ?
        con.commit(); db.close()
        return jsonify({
            'success': True,
            'message': f'Player {name} already exists, Updating to modder status!'
        })
    elif (advertiser == 1):
        db.execute("UPDATE PLAYERS SET ip=%s, times_seen = times_seen+1, last_seen=%s, note=%s, advertiser=%s WHERE rid=%s",
                   (ip, date, note, advertiser, rid))  # note=note || ?
        con.commit(); db.close()
        return jsonify({
            'success': True,
            'message': f'Player {name} already exists, Updating to advertiser status!'
        })
    else:
        db.execute(
            "UPDATE PLAYERS SET ip=%s, times_seen = times_seen+1, last_seen=%s WHERE rid=%s", (ip, date, rid))
        con.commit(); db.close()
        return jsonify({
            'success': True,
            'message': f'Player {name} already exists, Updating player status!'
        })

# http://127.0.0.1:80/api/v0/user/<rid>?key=<key>
@app.route('/api/v0/user/<rid>')
@limiter.limit("100/minute")
def get_all_user(rid):
    key = request.args.get('key')
    if (not check_user_key(key)):  # Check uploader key
        return jsonify({
            'success': False,
        }), HTTPStatus.FORBIDDEN
    try:
        lock.acquire(True)
        con.ping()
        db.execute(f"SELECT * FROM PLAYERS WHERE rid={rid}")
        all = db.fetchall()
        if (len(all) != 0):
            for row in all:
                return jsonify({
                    "data": {
                        'rokcstar_id': row[0],  # 0. rid
                        'rockstar_name': row[1],  # 1. name
                        'last_playerip': row[2],  # 2. last_ip
                        "player_note": row[3],  # 3. note
                        "is_modder": True if row[4] == 1 else False, # 4. is_modder
                        "advertiser": True if row[5] == 1 else False,
                        "risk": row[6],  # 5. risk
                        "whitelist": True if row[7] == 1 else False, # 6. whitelist
                        "times_seen": row[8],  # 7. times_seen
                        "last_seen": row[9],  # 8. last_seen
                        "first_seen": row[10],  # 9. first_seen
                        "added_by": row[11],  # 10. added_by
                    },
                    'success': False,
                    "message": "Succesfully retrieved data from the database"
                })
        else:
            return jsonify({
                'success': False,
                "message": "Player doesnt exist in the database"
            })
    finally:
        lock.release()


# app.run(host="0.0.0.0", port=4000, ssl_context=('f5.cert.pem', 'f5.key.pem'), debug=True)
app.run(host="0.0.0.0", port=4000, debug=False)
