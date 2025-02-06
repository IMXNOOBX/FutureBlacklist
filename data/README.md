# 📍 Database Dump
> The file [`./players.json`](./players.json) contains a list of players detected or scanned by this project.
},

# 📦 Data Structure

- `rid`: The player's unique identifier. [**spoofable**] (*a.k.a. Social Club Id*) 
- `name`: The player's name. [**spoofable**]
- `ip`: The player's IP address. [**spoofable**] (*from a long time ago*)
- `note`: A note about the player. (*unused*)
- `modder`: Whether the player is a modder. 
- `advertiser`: Whether the player is an advertiser.
- `risk`: The risk level of the player. (*unused*)
- `whitelist`: Whether the player is whitelisted. (*whitelisted players have been removed from the list*)
- `times_seen`: The number of times the player has been seen.
- `last_seen`: The timestamp of the last time the player was seen.
- `first_seen`: The timestamp of the first time the player was seen.

# 📈 Statistics

| Statistic       | Count   |
|-----------------|---------|
| Total Players   | 301,623 |
| Legit Players   | 295,665 |
| Modders         | 3,404   |
| Advertisers     | 2,554   |

* [**spoofable**]: this means that the value can be changed by a modder, and is not a reliable identifier in some cases