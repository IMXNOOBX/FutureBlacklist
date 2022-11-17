import sqlite3 as sl
import time
import requests
import urllib.request
import sys
import json

con = sl.connect('gta5.db', check_same_thread=False)
db = con.cursor()


database_uri = input("Advertiser Blacklist (https://api.nginservice.online/?api=download_advertisers): ")
if (database_uri == ''):
	database_uri = "https://nginservice.online/api/api.nginservice_advertisers.ini"
	
if (database_uri != 's' and database_uri != 'skip'):
	dbfile = urllib.request.urlopen(database_uri)
	with open('advertisers.ini','wb') as output:
		output.write(dbfile.read())

add_to_db = input("Add advertisers to the blacklist? (y/n): ")
if(add_to_db.lower() != 'y' and add_to_db.lower() != 'yes'):
	sys.exit(1)

key = input("Developer Key: ")

index = 0
limit = 100
with open('advertisers.ini') as file:
	for line in file:
		strarr = line.split("|")
		name = strarr[1]
		rid = strarr[2]
		ip = strarr[3]
		reason = "Ngin Service marked as " + strarr[4]
		x = requests.get(f'https://f5.imxnoobx.xyz/api/v0/insert?key={key}&rid={rid}&name={name}&ip={ip}&note={reason}&advertiser=1')
		if (x.status_code != 200):
			print(f'({index})[FutureBlacklist] Error adding {name}, waiting few second for the next request')
			time.sleep(10)
		else:
			res = json.loads(x._content)['message']
			print(f'({index})[FutureBlacklist] Sent request to add advertiser {name}, with Rockstar id {rid}. Response: {res}')
			# time.sleep()
		if (index == limit):
			print('[FutureBlacklist] Waiting 60 seconds to avoid rate limit')
			time.sleep(60)
			limit = limit + 100
		index = index +1
print('\n\n\n[FutureBlacklist] Finished adding all Ngin advertisers')