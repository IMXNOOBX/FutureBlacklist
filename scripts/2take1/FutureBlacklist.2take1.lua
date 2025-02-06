if not menu.is_trusted_mode_enabled(1 << 2) then
	menu.notify("You must turn on trusted mode->Natives to use this script.", "FutureBlacklist", 10, 0xff0000ff)
	return menu.exit()
end
if not menu.is_trusted_mode_enabled(1 << 3) then
	menu.notify("You must turn on trusted mode->Http to use this script.", "FutureBlacklist", 10, 0xff0000ff)
	return menu.exit()
end

local path_root = utils.get_appdata_path("PopstarDevs\\2Take1Menu\\scripts\\", "FBL")

local status, json = pcall(require, "FBL/json")
if (not status) then
	utils.make_dir(path_root)
	utils.to_clipboard("https://github.com/IMXNOOBX/ScriptKid/blob/main/lib/json.lua")
	menu.notify("Error, please download json library from the repository and add it to FBL/json.lua\nThe link has been compied to your clipboard!", "FutureBlacklist", 10, 0xff0000ff)
	return menu.exit()
end

local script = {
	host = "https://gtaapi.imxnoobx.com",

	scanned_players = {}, 
	session_stats = {
		scanned_players = 0,
		scanned_modders = 0,
	},
	flag = player.add_modder_flag('FutureBlacklist'),
	bail = menu.get_feature_by_hierarchy_key("online.lobby.bail")
}

local settings = {
	developer_key = '5H4JRC0YER63YH2BI72X',
	developer_mode = false,

	check_modders = true,
	check_advertisers = true,

	ignore_friends = true,

	modder_opt = 1,
	advertiser_opt = 1,
}

local modder_flags = {
    [1 << 0x00] = "Manual",
    [1 << 0x01] = "Player Model",
    [1 << 0x02] = "Scid Spoof",
    [1 << 0x03] = "Invalid Object",
    [1 << 0x04] = "Invalid Ped Crash",
    [1 << 0x05] = "Model Change Crash",
    [1 << 0x06] = "Player Model Change",
    [1 << 0x07] = "Rac",
    [1 << 0x08] = "Money Drop",
    [1 << 0x09] = "Sep",
    [1 << 0x0A] = "Attach Object",
    [1 << 0x0B] = "Attach Ped",
    [1 << 0x0C] = "Net Array Crash",
    [1 << 0x0D] = "Sync Crash",
    [1 << 0x0E] = "Net Event Crash",
    [1 << 0x0F] = "Host Token",
    [1 << 0x10] = "Se Spam",
    [1 << 0x11] = "Invalid Vehicle",
    [1 << 0x12] = "Frame Flags",
    [1 << 0x13] = "Ip Spoof",
    [1 << 0x14] = "Karen",
    [1 << 0x15] = "Session Mismatch",
    [1 << 0x16] = "Sound Spam",
    [1 << 0x17] = "Sep Int",
    [1 << 0x18] = "Suspicious Activity",
    [1 << 0x19] = "Chat Spoof",
    [1 << 0x1A] = "Ends",
}
--[[
		red = 0xff0000ff,
		yellow = 0xff00ffff,
		blue = 0xffff0000,
		green = 0xff00ff00,
		purple = 0xff800080,
		orange = 0xff0080ff,
		brown = 0xff336699,
		pink = 0xffff00ff
]]

local functions = {
	api_get_player = function(rid, callback)
		local code, body, headers = web.get(script.host.."/api/v1/user/"..rid)
		if(tonumber(code) ~= 200) then return callback(-1) end
		local parsed = json.decode(body)

		if parsed['success'] == false then
			return callback(-2)
		end
		if parsed['data']['is_modder'] == true then 
			return callback(1, parsed['data']['player_note']:gsub("+", " "))
		end
		if parsed['data']['advertiser'] == true then 
			return callback(2, parsed['data']['player_note']:gsub("+", " "))
		end
		if parsed['success'] == true then
			return callback(0, parsed['data']['player_note']:gsub("+", " "))
		end
		return callback(-1)
	end,
	api_add_player = function(rid, name, ip, reason, modder, callback)
		if (settings.developer_key == '') then return end
		local code, body, headers = web.get(script.host.."/api/v0/insert?key="..settings.developer_key.."&rid="..rid.."&name="..name.."&ip="..ip.."&note="..reason.."&modder="..modder)
		if(tonumber(code) == 429) then return callback("Error while adding player. Rate limit exceeded!") end
		if(tonumber(code) ~= 200) then print(body) return callback("Invalid response code: "..code) end
		local parsed = json.decode(body)
		if parsed["message"] ~= "" then 
			return callback(parsed["message"])
		end
	end,
	api_get_stats = function(callback)
		local code, body, headers = web.get(script.host.."/api/v1/stats")
		if(tonumber(code) ~= 200) then return callback(false) end
		local parsed = json.decode(body)
		if parsed["data"] ~= "" then 
			return callback({
				total_players =  parsed["data"].total_players or 0,
				legit_players = parsed["data"].legit_players or 0,
				modders = parsed["data"].modders or 0,
				advertisers = parsed["data"].advertisers or 0
			})
		end
	end,
	to_ipv4 = function(ip) -- Same
		return string.format("%i.%i.%i.%i", ip >> 24 & 255, ip >> 16 & 255, ip >> 8 & 255, ip & 255)
	end,
	notify = function(string, type)
		string = tostring(string)
		local color = 0x2C7CFE00
		if type == 'success' then
			color = 0x00FF00FF
		elseif type == 'error' then
			color = 0xFF0000FF
		end
		menu.notify(string, "FutureBlacklist", 10, color)
		print('[FutureBlacklist] | '..string)
	end,
	player_join_reaction = function(pid, type, callback)
		local reaction = type == 1 and settings.modder_opt or settings.advertiser_opt

		local name = player.get_player_name(pid)

		if reaction == 0 then
			player.set_player_as_modder(pid, script.flag)
		elseif reaction == 1 then
			player.set_player_as_modder(pid, script.flag)
			network.force_remove_player(pid)
		end
		
		return callback('Apliying reaction to '..name..' for '..(type == 1 and "Modding" or "Advertising") .. ' Reaction: '.. (reaction == 1 and 'Kick' or 'Flag'))
	end,
	get_session_type = function()
		if network.is_session_started() then
			if native.call(0xF3929C2379B60CCE):__tointeger() == 1 then -- NETWORK_SESSION_IS_SOLO
				return "solo"
			elseif native.call(0xCEF70AA5B3F89BA1):__tointeger() == 1 then -- NETWORK_SESSION_IS_PRIVATE
				return "invite_only"
			elseif native.call(0xFBCFA2EA2E206890):__tointeger() == 1 then -- NETWORK_SESSION_IS_CLOSED_FRIENDS
				return "friend_only"
			elseif native.call(0x74732C6CA90DA2B4):__tointeger() == 1 then -- NETWORK_SESSION_IS_CLOSED_CREW
				return "crew_only"
			end
			return "public"
		end
		return "singleplayer"
	end
	
}

local root = menu.add_feature("FutureBlacklist", "parent", 0)
local developer_root = menu.add_feature("Developer Options", "parent", root.id)

local player_scanner = menu.add_feature("Scan Players", "toggle", developer_root.id)
player_scanner.on = true
local session_scanning = menu.add_feature("Session Scanning", "toggle", developer_root.id)
local dev_debug = menu.add_feature("Debug Script", "toggle", developer_root.id, function(val)
	settings.developer_mode = val.on
	if (settings.developer_mode) then functions.notify('[Dev] Debug script > ' .. tostring(val.on)) end
end)
dev_debug.on = settings.developer_mode
menu.add_feature(">\tFutureBlacklist", "action", root.id)
local modder_check = menu.add_feature("Check For Modders", "toggle", root.id, function(val)
	settings.check_modders = val.on
	if (settings.developer_mode) then functions.notify('[Dev] Check For Modders > ' .. tostring(val.on)) end
end)
modder_check.on = settings.check_modders
local advertiser_check = menu.add_feature("Check For Advertisers", "toggle", root.id, function(val)
	settings.check_advertisers = val.on
	if (settings.developer_mode) then functions.notify('[Dev] Check For Advertisers > ' .. tostring(val.on)) end
end)
advertiser_check.on = settings.check_advertisers
menu.add_feature(">\tReactions", "action", root.id)
local modder_action = menu.add_feature("Reaction To Modders", "autoaction_value_str", root.id, function(val)
	settings.modder_opt = val.value
	if (settings.developer_mode) then functions.notify('[Dev] Reaction To Modders > ' .. tostring(val.value)) end
end)
-- modder_action.value = settings.modder_opt
-- settings.modder_opt = modder_action.value 
local advertiser_action = menu.add_feature("Reaction To Advertisers", "autoaction_value_str", root.id, function(val)
	settings.advertiser_opt = val.value
	if (settings.developer_mode) then functions.notify('[Dev] Reaction To Advertisers > ' .. tostring(val.value)) end
end)
-- advertiser_action.value = settings.advertiser_opt
-- settings.advertiser_opt = advertiser_action.value
modder_action.str_data = {"Flag", "Kick & Flag"}; modder_action.value = settings.modder_opt
advertiser_action.str_data = {"Flag", "Kick & Flag"}; advertiser_action.value = settings.advertiser_opt



menu.create_thread(function() 
	while true do
		if (not session_scanning.on) then goto skip_session end
	
		if (not network.is_session_started()) then
			if (settings.developer_mode) then functions.notify('[Dev] hopping to online mode Story > Online') system.yield(500) end
			network.join_new_lobby(0)
			system.yield(30 * 1000)
		end
		if #script.scanned_players == 0 then
			if (settings.developer_mode) then functions.notify('[Dev] switching sessions Online > Online') system.yield(500) end
			network.join_new_lobby(0)
			system.yield(10 * 1000)
		end

		if (functions.get_session_type() == 'singleplayer') then
			if (settings.developer_mode) then functions.notify('[Dev] Something weird happen, bailing Online > Story') system.yield(500) end
			bail:toggle()
			system.yield(60 * 1000)
		end

		::skip_session::
		system.yield(1000)
	end
end)

menu.create_thread(function() 
	while true do
		local player_obj = #script.scanned_players >= 1 and script.scanned_players[1] or nil

		if (not player_scanner.on or not player_obj) then goto skip_player end -- gives scope error if done the player_obj check after

		functions.api_add_player(player_obj.rid, player_obj.name, player_obj.ip, "Normal player.", 0, function(res) 
			if (settings.developer_mode) then functions.notify('[Dev] Adding player API response: '..tostring(res)) end
			script.session_stats.scanned_players = script.session_stats.scanned_players +1
		end)

		table.remove(script.scanned_players, 1)

		::skip_player::
		system.yield(1000)
	end
end)

event.add_event_listener("player_join", function(joined_player)
	local ply = joined_player.player

	if ply == player.player_id() then return end
	if settings.ignore_friends and player.is_player_friend(ply) then return end

	local rid = player.get_player_scid(ply)
	local name = player.get_player_name(ply)
	local ip = functions.to_ipv4(player.get_player_ip(ply))

	functions.api_get_player(rid, function(result, note) 
		if (result == 1 and settings.check_modders == true) or (result == 2 and settings.check_advertisers == true) then
			if (settings.developer_mode) then functions.notify('[Dev] Appliying reaction to '..name..' because ' ..note, "success") end
			functions.player_join_reaction(ply, result, function(message) 
				functions.notify(message)
			end)
		end
	end)

	table.insert(script.scanned_players, {
		ply = ply,
		rid = rid,
		ip = ip,
		name = name or "Invalid Name"
	})
end)

event.add_event_listener("modder", function(data)
	local ply = data.player
	local flag = data.flag

	if settings.ignore_friends and player.is_player_friend(ply) then return end

	local rid = player.get_player_scid(ply)
	local name = player.get_player_name(ply)
	local ip = functions.to_ipv4(player.get_player_ip(ply))
	local flag_str = modder_flags[flag]
	
	if (settings.developer_key == '') then 
		return functions.notify('Failed to add modder, api key not specified!', "error")
	end

	functions.api_add_player(rid, name, ip, "2take1 modder detection. Reason: " .. flag_str, 1, function(res) 
		if (settings.developer_mode) then functions.notify('[Dev] Sendig request to add modder ('..name..'): '..tostring(res)) end
		script.session_stats.scanned_modders = script.session_stats.scanned_modders +1
	end)
end)

local thread_id
thread_id = menu.create_thread(function() 
	functions.api_get_stats(function(stats)
		if not stats then return end
		
		functions.notify("Blacklist Stats\nTotal Players: "..stats.total_players.."\nLegit Players: "..stats.legit_players.."\nModders: "..stats.modders.."\nAdvertisers: "..stats.advertisers)
	end)

	while (not menu.has_thread_finished(thread_id)) do system.yield(1) end
	menu.delete_thread(thread_id)
end)