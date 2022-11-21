local json = require("lib/json")

local config = {
	reaction = 'block_join',
	exclude_frieds = true,
	notifications = true,
}

local script = {
	developer_key = '5H4JRC0YER63YH2BI72X',
	host = "https://api.futuredb.shop",

	detection_limiter = {}
}

local utl = {
	block_join = {},
	modder_severity = {
		[1 << 0] = "low",
		[1 << 1] = "medium",
		[1 << 2] = "low",
		[1 << 3] = "low",
		[1 << 4] = "high",
		[1 << 5] = "high",
		[1 << 6] = "medium",
		[1 << 7] = "medium",
		[1 << 8] = "medium",
		[1 << 9] = "none", -- Chat Censorship, Can be caused by false positives (midnight's foult as spamming in chat can couse it)
		[1 << 10] = "high",
	},
	get_real_ip = function(ply)
		local ip = player.get_resolved_ip_string(ply)
		return (ip == "0.0.0.0" or ip == "" or ip == nil) and player.get_ip_string(ply) or ip
	end,
	api_player_exists = function(rid)
		http.get(script.host.."/api/v1/user/exist/"..rid, function(code, headers, content) -- .. instead of +, attempt to add a 'string' with a 'string'. fuck lua
			if(code ~= 200) then return false end
			local parsed = json.decode(content)
			if parsed["success"] == true then 
				return true 
			end
			return false
		end)
	end,
	api_add_player = function(rid, name, ip, reason, modder)
		http.get(script.host.."/api/v0/insert?key="..script.developer_key.."&rid="..rid.."&name="..name.."&ip="..ip.."&note="..reason.."&modder="..modder, function(code, headers, content)
			if(code ~= 200) then return false end
			local parsed = json.decode(content)
			prit(parsed['message'])
			if parsed['success'] == true and parsed["message"] ~= "" then 
				return parsed["message"]
			end
			return false
		end)
	end,
	api_get_player = function(rid)
		http.get(script.host.."/api/v1/user/"..rid, function(code, headers, content)
			if(code ~= 200) then return {-1} end
			local parsed = json.decode(content)
			print(parsed['message'])
			if parsed['success'] == false then
				return {-1}
			end
			if parsed['data']['is_modder'] == true then 
				print(parsed['data']['player_note'])
				return {1, parsed['data']['player_note']:gsub("+", " ")}
			end
			if parsed['data']['advertiser'] == true then 
				print(parsed['data']['player_note'])
				return {2, parsed['data']['player_note']:gsub("+", " ")}
			end
			return {-1}
		end)
	end
}

function add_modder(ply, name, rid, ip, reason, modder)
	rid = tostring(rid)
	local r_ip = utl.get_real_ip(ply)
	if r_ip == "" then r_ip = ip end
	if modder then modder = 1 else modder = 0 end
	--if reason and reason ~= "" then reason = reason:gsub(" ", "+") end
	local res = utl.api_add_player(rid, name, r_ip, reason, modder)
	if res then
		if config.notifications then utils.notify('FutureBlackList', 'Adding player: '..player.get_name(ply).."\n"..res, gui_icon.players, notify_type.success) end
	end
end

function OnModderDetected(ply, reason)
	local detect_severity = utl.modder_severity[reason] or 'none'
	if(detect_severity == "none") then return end
	if config.exclude_frieds and player.is_friend(ply) then return end

	add_modder(ply, player.get_name(ply), player.get_rid(ply), player.get_ip_string(ply), "Midnight modder detection."..reason, true)
end

function OnPlayerJoin(ply, name, rid, ip, host_key)
	if config.exclude_frieds and player.is_friend(ply) then return end

	add_modder(ply, name, rid, ip, "Normal player.", false)
	local res = utl.api_get_player(rid)
	if res and res[1] ~= -1 then
		if config.notifications then utils.notify('FutureBlackList', 'Blacklisted player detected: '..name..'\nReason: '..res[2], gui_icon.players, notify_type.important) end
		utl.block_join[ply] = true
	end
end

function OnPlayerActive(ply) 
	if not utl.block_join[ply] or utl.block_join[ply] == false then return end

	if config.reaction == 'block_join' then
		player.kick_idm(ply)
		if config.notifications then utils.notify('FutureBlackList', 'Name: '..player.get_name(ply)..'\nR* ID: '..player.get_rid(ply)..'\nReason: Blacklisted Player\nReaction: Block Join', gui_icon.players, notify_type.important) end
	end
end

function OnPlayerLeft(ply)
	utl.block_join[ply] = false
end

function OnInit() -- Load
	if config.notifications then utils.notify('FutureBlackList', 'From now on registering players', gui_icon.players, notify_type.default) end
end

function OnDone() -- Unload
	if config.notifications then utils.notify('FutureBlackList', 'Script disabled, be careful!', gui_icon.players, notify_type.default) end
end