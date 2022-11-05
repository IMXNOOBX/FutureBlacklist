local config = {
	reaction = 'block_join',
	exclude_frieds = true,
	notifications = true,
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
		[1 << 9] = "none", -- Can be caused by false positives
		[1 << 10] = "high",
	},
	get_real_ip = function(ply)
		local ip = player.get_resolved_ip_string(ply)
		return ip == "0.0.0.0" and player.get_ip_string(ply) or ip
	end,
	split = function(s, delimiter)
		local result = {}
		for match in (s..delimiter):gmatch("(.-)"..delimiter) do
			table.insert(result, match)
		end
		return result
	end,
	api_player_exists = function(rid)
		http.get("http://127.0.0.1:5000/api/v1/users/exist/" + rid, function(code, headers, content)
			if(code ~= 200) then return false end
			string.match(content, "true")
		end)
	end
}

local function add_modder(ply, name, rid, ip, reason, severity)
	rid = tostring(rid)
	ip = tostring(ip)
	
	if not getModderLogs(name, rid, ip) then
		local data = timestamp..' | '..name..' | '..rid..' | '..ip..' | '..reason..' | '..severity..'\n'
		file.writeFile(config.path, data)
	end
end


function OnModderDetected(ply, reason)
	local detect_reason = utl.modder_reasons[reason] or "Modder detection - " .. tostring(reason)
	local detect_severity = utl.modder_severity[reason] or 'none'
	if(detect_severity == "none") then return end
	if config.exclude_frieds and player.is_friend(ply) then return end


end

function OnSyncBlocked(ply, reason, ban_time)
	if config.exclude_frieds and player.is_friend(ply) then return end

end

function OnPlayerJoin(ply, name, rid, ip, host_key)
	if config.exclude_frieds and player.is_friend(ply) then return end

	
end

function OnPlayerActive(ply) 
	if not utl.block_join[ply] then return end

	if config.reaction == 'block_join' then
		player.kick_idm(ply)
		if config.notifications then utils.notify('FutureShield', 'Name: '..name..'\nR* ID: '..rid..(memory and '\nReason: Blacklisted Player' or '\nModder Detected')..'\nReaction: Block Join', gui_icon.players, notify_type.default) end
	end
end


function OnInit() -- Load
	if config.notifications then utils.notify('FutureBlackList', 'From now on checking for modder activity', gui_icon.players, notify_type.default) end
end

function OnDone() -- Unload
	if config.notifications then utils.notify('FutureBlackList', 'Script disabled, be careful!', gui_icon.players, notify_type.default) end
end