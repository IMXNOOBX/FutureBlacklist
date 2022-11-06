import datetime
import json
import threading
from flask import Flask, jsonify, request
# https://flask-limiter.readthedocs.io/en/stable/
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import sqlite3 as sl

app = Flask(__name__)
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["5000 per hour"],
    storage_uri="memory://",
)

lock = threading.Lock()

con = sl.connect('gta5.db', check_same_thread=False)
db = con.cursor()

with con:
    con.execute(f"""
        CREATE TABLE IF NOT EXISTS PLAYERS (
            rid INTEGER NOT NULL PRIMARY KEY,
            name TEXT,
            ip TEXT,
            note TEXT,
            modder INTEGER,
            last_seen DATE,
            first_seen DATE
        );
    """)

@app.route('/')
def index():
    return jsonify({'success': True,
                    'endpoints': {
                        "GET user": "/api/v1/user/<rid>",
                        "GET user exist": "/api/v1/users/exist/<rid>",
                        "GET add user": "/api/v1/insert?rid=<rid>&name=<name>&ip=<ip>&note=<note>&modder=<modder>",
                    }})

# @app.route("/slow")
# @limiter.limit("1 per 5 minutes")
# def slow():
#     return ":("

def check_if_exists(rid):
    try:
        lock.acquire(True)
        data = db.execute(f"SELECT * FROM PLAYERS WHERE rid={rid}")
        check = data.fetchall()
        # print(check)
        return False if len(check) == 0 else True
    finally:
        lock.release()


@app.route('/api/v1/user/<rid>')
@limiter.limit("100/minute")
def get_user(rid):
    try:
        lock.acquire(True)
        data = db.execute(f"SELECT * FROM PLAYERS WHERE rid={rid}")
        all = data.fetchall()
        if(len(all) != 0):
            for row in all:
                return jsonify({
                    "data": {
                        'rokcstar_id': row[0],
                        'rockstar_name': row[1],
                        'last_playerip': row[2],
                        "player_note": row[3],
                        "is_modder": True if row[4] else False,
                        "last_seen": row[5],
                        "first_seen": row[6]
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

@app.route('/api/v1/user/exist/<rid>')
@limiter.limit("100/minute")
def exist_user(rid):
    return jsonify({
            'success': check_if_exists(rid)
        })

      
# http://127.0.0.1:5000/api/v1/insert?rid=8167293698&name=ADaDadas&ip=1.1.1.1
@app.route('/api/v1/insert')
def add_user():
    rid = request.args.get('rid')
    name = request.args.get('name')
    ip = request.args.get('ip')
    note = request.args.get('note') or None
    modder = 1 if (request.args.get('modder') == "1" or request.args.get('modder') == "true") else 0
    date = datetime.datetime.now()
    if (not check_if_exists(rid)):
        values = {  # https://stackoverflow.com/a/16698310/15384495
            'rid': rid, 
            'name': name, 
            'ip': ip,
            'note': note, 
            'modder': modder, 
            'last_seen': date, 
            'first_seen': date
        }
        db.execute(f""" 
            INSERT INTO PLAYERS (rid, name, ip, note, modder, last_seen, first_seen) VALUES (:rid, :name, :ip, :note, :modder, :last_seen, :first_seen);
        """, values)
        con.commit()
        return jsonify({
            'success': True,
            'message': f'Added {name} successfully'
        })
    elif(modder == 1):
        db.execute(f"UPDATE PLAYERS SET ip=?, last_seen=?, note=?, modder=? WHERE rid=?", (ip, date, note, modder, rid))
        con.commit()
        return jsonify({
            'success': False,
            'message': f'Player {name} already exists, Updating to modder status!'
        })
    else:
        db.execute(f"UPDATE PLAYERS SET ip=?, last_seen=? WHERE rid=?", (ip, date, rid))
        con.commit()
        return jsonify({
            'success': False,
            'message': f'Player {name} already exists, Updating player status!'
        })


app.run(port=80)
