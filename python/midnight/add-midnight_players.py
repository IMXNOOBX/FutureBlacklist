import time
import requests
import urllib.request
import sys
import json

blacklist_path = input("Player database: ")
if (blacklist_path == ''):
	blacklist_path = "./players.log"
	
add_to_db = input("Add players to the database? (y/n): ")
if(add_to_db.lower() != 'y' and add_to_db.lower() != 'yes'):
	sys.exit(1)

key = input("Developer Key: ")

index = 0
limit = 99
with open(blacklist_path) as file:
	for line in file:
		strarr = line.split(" | ")
		fseen = strarr[0]
		name = strarr[1]
		rid = strarr[2]
		ip = strarr[3]
		reason = "Normal+player."
		x = requests.get(f'https://f5.imxnoobx.xyz/api/v0/insert?key={key}&rid={rid}&name={name}&ip={ip}&note={reason}&firstseen={fseen}')
		if (x.status_code != 200):
			print(f'({index})[FutureBlacklist] Error adding {name}, waiting 10 second for the next request')
			time.sleep(10)
		else:
			res = json.loads(x._content)['message']
			print(f'({index})[FutureBlacklist] Sent request to add player {name}, with Rockstar id {rid}. Response: {res}.')
			# print(x._content)
			# time.sleep()
		if (index == limit):
			print('[FutureBlacklist] Waiting 60 seconds to avoid rate limit')
			time.sleep(60)
			limit = limit + 100
		index = index +1
print('\n\n\n[FutureBlacklist] Finished adding all midnight player history')