import sqlite3 as sl

con = sl.connect('gta5.db', check_same_thread=False)
db = con.cursor()


key_auth = input("User key_auth: ")
name = input("User name: ")
discord_id = input("User id: ")

values = {  # https://stackoverflow.com/a/16698310/15384495
	'key_auth': key_auth, 
	'name': name, 
	'discord_id': discord_id,
}

db.execute(f""" 
	INSERT INTO USER (key_auth, name, discord_id) VALUES (:key_auth, :name, :discord_id);
""", values)
con.commit()
print('added')