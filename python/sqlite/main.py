import datetime
import json
import threading
from flask import Flask, jsonify, request
# https://flask-limiter.readthedocs.io/en/stable/
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import sqlite3 as sl
from http import HTTPStatus
import time

app = Flask(__name__)
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["5000 per hour", "100/minute"],
    storage_uri="memory://",
)

lock = threading.Lock()

con = sl.connect('gta5.db', check_same_thread=False)
db = con.cursor()

with con:
    # PLAYERS added_by atribute is USER's key_auth primary key
    con.execute(f"""
        CREATE TABLE IF NOT EXISTS PLAYERS (
            rid INTEGER NOT NULL PRIMARY KEY,
            name TEXT,
            ip TEXT,
            note TEXT,
            modder INTEGER DEFAULT 0,
            advertiser INTEGER DEFAULT 0,
            risk INTEGER DEFAULT 0,
            whitelist INTEGER DEFAULT 0,
            times_seen INTEGER DEFAULT 0,
            last_seen DATE,
            first_seen DATE,
            added_by STRING NOT NULL
        );
    """)
    con.execute(f"""
        CREATE TABLE IF NOT EXISTS USER (
            key_auth TEXT NOT NULL PRIMARY KEY,
            name TEXT,
            discord_id TEXT NOT NULL,
            ip TEXT
        );
    """)

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
    time.sleep(0.1)
    try:
        lock.acquire(True)
        data = db.execute(f"SELECT * FROM PLAYERS WHERE rid={rid}")
        check = data.fetchall()
        # print(check)
        return False if len(check) == 0 else True
    finally:
        lock.release()

def check_user_key(key):
    if (not key):
        return False
    time.sleep(0.1)
    try:
        lock.acquire(True)
        data = db.execute(f"SELECT * FROM USER WHERE key_auth='{key}'")
        check = data.fetchall()
        # print(check)
        return False if len(check) == 0 else True
    finally:
        lock.release()

# http://127.0.0.1:80/api/v1/user/<rid>
@app.route('/api/v1/user/<rid>')
@limiter.limit("100/minute")
def get_user(rid):
    db = con.cursor()
    data = db.execute(f"SELECT * FROM PLAYERS WHERE rid={rid}")
    all = data.fetchall()
    db.close()
    if(len(all) != 0):
        for row in all:
            if (row[7] == 1) :
                return jsonify({
                    'success': False,
                    "message": "Player doesnt exist in the database"
                })
            return jsonify({
                "data": {
                    'rokcstar_id': row[0], # 0. rid
                    'rockstar_name': row[1], # 1. name
                    # 'last_playerip': row[2], # 2. last_ip
                    "player_note": row[3], # 3. note
                    "is_modder": True if row[4] == 1 else False, # 4. is_modder
                    "advertiser": True if row[5] == 1 else False,
                    "risk": row[6], # 5. risk
                    # "whitelist": True if row[7] == 1 else False, # 6. whitelist
                    # "times_seen": row[8], # 7. times_seen
                    "last_seen": row[9], # 8. last_seen
                    "first_seen": row[10], # 9. first_seen
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

# http://127.0.0.1:80/api/v1/user/exist/<rid>
@app.route('/api/v1/user/exist/<rid>')
@limiter.limit("100/minute")
def exist_user(rid):
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
    modder = 1 if (request.args.get('modder') == "1" or request.args.get('modder') == "true") else 0
    risk = request.args.get('risk') if (request.args.get('risk') and request.args.get('risk').isdigit() and 0 <= request.args.get('risk') < 3) else 0 # range 0-2, None, Medium, High
    request_ip = request.remote_addr
    date = datetime.datetime.now()
    if (not check_user_key(key)): # Check uploader key
        return jsonify({
            'success': False,
        }), HTTPStatus.FORBIDDEN
    if (not rid or not name): # Check important arguments
        return jsonify({
            'success': False,
        }), HTTPStatus.BAD_REQUEST
    db = con.cursor()
    db.execute(f"UPDATE USER SET ip=? WHERE key_auth=?", (request_ip, key)) 
    if (not check_if_exists(rid)):
        values = {  # https://stackoverflow.com/a/16698310/15384495
            'rid': rid, 
            'name': name, 
            'ip': ip,
            'note': note, 
            'modder': modder, 
            'risk': risk, 
            'last_seen': date, 
            'first_seen': date,
            'added_by': key
        }
        db.execute(f""" 
            INSERT INTO PLAYERS (rid, name, ip, note, modder, risk, last_seen, first_seen, added_by) VALUES (:rid, :name, :ip, :note, :modder, :risk, :last_seen, :first_seen, :added_by);
        """, values)
        con.commit(); db.close()
        return jsonify({
            'success': True,
            'message': f'Added {name} successfully'
        })
    elif(modder == 1):
        db.execute(f"UPDATE PLAYERS SET ip=?, times_seen = times_seen+1, last_seen=?, note=note + ?, modder=? WHERE rid=?", (ip, date, str(', ', note), modder, rid)) # note=note || ?
        con.commit(); db.close()
        return jsonify({
            'success': True,
            'message': f'Player {name} already exists, Updating to modder status!'
        })
    else:
        db.execute(f"UPDATE PLAYERS SET ip=?, times_seen = times_seen+1, last_seen=? WHERE rid=?", (ip, date, rid))
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
    if (not check_user_key(key)): # Check uploader key
        return jsonify({
            'success': False,
        }), HTTPStatus.FORBIDDEN
    db = con.cursor()
    data = db.execute(f"SELECT * FROM PLAYERS WHERE rid={rid}")
    all = data.fetchall()
    db.close()
    if(len(all) != 0):
        for row in all:
            return jsonify({
                "data": {
                    'rokcstar_id': row[0], # 0. rid
                    'rockstar_name': row[1], # 1. name
                    'last_playerip': row[2], # 2. last_ip
                    "player_note": row[3], # 3. note
                    "is_modder": True if row[4] == 1 else False, # 4. is_modder
                    "advertiser": True if row[5] == 1 else False,
                    "risk": row[6], # 5. risk
                    "whitelist": True if row[7] == 1 else False, # 6. whitelist
                    "times_seen": row[8], # 7. times_seen
                    "last_seen": row[9], # 8. last_seen
                    "first_seen": row[10], # 9. first_seen
                    "added_by": row[11], # 10. added_by
                },
                'success': False,
                "message": "Succesfully retrieved data from the database"
            })
    else:
        return jsonify({
            'success': False,
            "message": "Player doesnt exist in the database"
        })



app.run(host="0.0.0.0", port=4000, debug=True)
