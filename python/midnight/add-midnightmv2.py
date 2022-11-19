import time
import requests
import urllib.request
import sys
import json

blacklist_path = input("Modder Blacklist: ")
if (blacklist_path == ''):
	blacklist_path = "./session_manager_adv.json"
	
add_to_db = input("Add modders to the blacklist? (y/n): ")
if(add_to_db.lower() != 'y' and add_to_db.lower() != 'yes'):
	sys.exit(1)

key = input("Developer Key: ")

index = 0
limit = 99
with open(blacklist_path) as file:
	json_data = json.load(file)
	for modders in json_data['Modders']:
		rid = modders
		name = json_data['Modders'][modders]['name']
		ip = json_data['Modders'][modders]['last_ip']
		reason = "Midnight+modder+detection."
		print(f'https://f5.imxnoobx.xyz/api/v0/insert?key={key}&rid={rid}&name={name}&ip={ip}&note={reason}&modder=1')
		# x = requests.get(f'https://f5.imxnoobx.xyz/api/v0/insert?key={key}&rid={rid}&name={name}&ip={ip}&note={reason}&modder=1')
		# if (x.status_code != 200):
		# 	print(f'({index})[FutureBlacklist] Error adding {name}, waiting 10 second for the next request')
		# 	time.sleep(10)
		# else:
		# 	res = json.loads(x._content)['message']
		# 	print(f'({index})[FutureBlacklist] Sent request to add modder {name}, with Rockstar id {rid}. Response: {res}.')
		# 	# print(x._content)
		# 	# time.sleep()
		# if (index == limit):
		# 	print('[FutureBlacklist] Waiting 60 seconds to avoid rate limit')
		# 	time.sleep(60)
		# 	limit = limit + 100
		index = index +1
print('\n\n\n[FutureBlacklist] Finished adding all midnight modders')