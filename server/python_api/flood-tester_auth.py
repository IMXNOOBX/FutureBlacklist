import requests
import json
import time


index = 0
with open('advertisers.ini') as file:
	for line in file:
		rid = line.split("|")[2]
		x = requests.get(f'https://f5.imxnoobx.xyz/api/v0/user/{rid}?key=5H4JRC0YER63YH2BI72X')
		if (x.status_code != 200):
			print(f'({index})[FutureBlacklist] Request error, code: {x.status_code}, sleeping 10 seconds.')
			time.sleep(10)
		else:
			res = json.loads(x._content)['message']
			print(f'({index})[FutureBlacklist] Recived data from server. Response: {res}')
		index = index +1