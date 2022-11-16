import mysql.connector
import random
import string

con = mysql.connector.connect(
  host="localhost",
  user="Future5",
  password="GNB82hBjtA54P8ey",
  database="future5"
)
db = con.cursor()


key_auth = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(20))
input_key_auth = input(f"key auth ({key_auth}): ")
if (input_key_auth != ""):
	key_auth =input_key_auth
name = input("User name: ")
discord_id = input("User id: ")

# https://stackoverflow.com/a/37406328/15384495
db.execute(f"INSERT INTO USER (key_auth, name, discord_id) VALUES (%s, %s, %s)", (key_auth, name, discord_id))
con.commit()
con.close()
db.close()
print('added')