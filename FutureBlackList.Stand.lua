-- FutureBlackList v1.0.0
util.require_natives(1660775568)
util.keep_running()
local json = require "lib/json"

local script = {
	developer_key = '',
	host = "https://f5.imxnoobx.xyz",

	friend_handle_ptr = memory.alloc(13*8),

	detection_limiter = {}
}

local settings = {
	check_modders = true,
	check_advertisers = true,

	ignore_friends = true,
    
    react_to_m = {
		"Block Join (Temporal)", 
		"BJ & Blacklist Locally", 
		"Remove By Any Means"
    },
	m_opt = 1,
    react_to_adv = {
		"Block Join (Temporal)", 
		"BJ & Blacklist Locally", 
		"Remove By Any Means"
    },
	adv_opt = 1,
}

local devs = {
	scan_all = true,
	scan_modders = true,
	scan_advertisers = true,

	debug_http = false,

	block_joinm = {
		"Stand History",
		"Desync (Coded)",
		"Desync/Breakup"
	},
	block_joinm_opt = 1,
}

local functions = {
	api_player_exists = function(rid)
		async_http.init(script.host, "/api/v1/user/exist/"..rid, function(body, header_fields, status_code) 
			if (devs.debug_http == true) then util.toast('[Dev] api_player_exists response: '..status_code) end
			if(tonumber(status_code) ~= 200) then return false end
			local parsed = json.decode(body)
			if parsed['success'] == false then
				return false
			end
			if parsed['exist'] == true then 
				return true 
			end
		end, function()
			return false 
		end)
		async_http.dispatch()
	end,
	api_get_player = function(rid)
		async_http.init(script.host, "/api/v1/user/"..rid, function(body, header_fields, status_code) 
			if (devs.debug_http == true) then util.toast('[Dev] api_get_player response: '..status_code) end
			if(tonumber(status_code) ~= 200) then return false end
			local parsed = json.decode(body)
			if parsed['success'] == false then
				return -1 
			end
			if parsed['data']['is_modder'] == true then 
				return 1 
			end
			if parsed['data']['advertiser'] == true then 
				return 2
			end
			return -1
		end, function()
			return -1 
		end)
		async_http.dispatch()
	end,
	api_add_player = function(rid, name, ip, reason, modder)
		async_http.init(script.host, "/api/v0/insert?key="..script.developer_key.."&rid="..rid.."&name="..name.."&ip="..ip.."&note="..reason.."&modder="..modder, function(body, header_fields, status_code) 
			-- print(tostring(status_code))
			if (devs.debug_http == true) then util.toast('[Dev] api_add_player response: '..status_code) end
			if(tonumber(status_code) == 403) then return "Error while adding player. Most likely invalid key!" end
			if(tonumber(status_code) ~= 200) then return false end
			local parsed = json.decode(body)
			if parsed['success'] == false then
				return false
			end
			if parsed["message"] ~= "" then 
				return parsed["message"] 
			end
		end, function()
			return false
		end)
		async_http.dispatch()
	end,
	pid_to_handle = function(pid)-- Credits: lancescript_reloaded
		NETWORK.NETWORK_HANDLE_FROM_PLAYER(pid, script.friend_handle_ptr, 13)
		return script.friend_handle_ptr
	end,
	to_ipv4 = function(ip) -- Same
		return string.format(
			"%i.%i.%i.%i", 
			ip >> 24 & 0xFF, 
			ip >> 16 & 0xFF, 
			ip >> 8  & 0xFF, 
			ip 		 & 0xFF
		)
	end,
	player_join_reaction = function(pid, type)
		local reaction = type == 1 and settings.m_opt or settings.adv_opt

		if (reaction == 1) then
			util.create_thread(function() 
                menu.trigger_command(('Online>Player History>'..players.get_name(pid)..'>Player Join Reactions>Block Join'), 'on')
				util.yield(60000)
				menu.trigger_command(('Online>Player History>'..players.get_name(pid)..'>Player Join Reactions>Block Join'), 'off')
				util.stop_thread()
			end)
		elseif (reaction == 2) then
			menu.trigger_command(('Online>Player History>'..players.get_name(pid)..'>Player Join Reactions>Block Join'), 'on')
		elseif (reaction == 3) then
			menu.trigger_command(('Online>Player History>'..players.get_name(pid)..'>Player Join Reactions>Block Join'), 'on') -- breakup/Desync
		end
		util.toast('[FutureBlacklist] Apliying reaction to '..players.get_name(pid)..' for '..type == 1 and "Modding" or "Advertiser")
	end
}
local root = menu.my_root()
local admin_tab = menu.list(root, 'Developer Options', {}, '', function() end)
menu.divider(root, "Future Blacklist")
menu.toggle(root, 'Check For Modders', {'fbimodders'}, 'Future Blacklist Inspect for modders', function(val)
    settings.check_modders = val
end, settings.check_modders)
menu.toggle(root, 'Check For Advertisers', {'fbiadvertisers'}, 'Future Blacklist Inspect for advertiser', function(val)
    settings.check_advertisers = val
end, settings.check_advertisers)

menu.divider(root, "Reactions")
menu.list_select(root, "Reaction To Modders", {}, "The reaction that will be applied if the blacklisted user is modder", settings.react_to_m, settings.m_opt,  function(val) 
	settings.m_opt = val
	util.toast('[FutureBlacklist] Reaction To Modders set to '..settings.react_to_m[settings.m_opt])
end)
menu.list_select(root, "Reaction To Advertisers", {}, "The reaction that will be applied if the blacklisted user is modder", settings.react_to_adv, settings.adv_opt, function(val) 
	settings.adv_opt = val
	util.toast('[FutureBlacklist] Reaction To Advertisers set to '..settings.react_to_adv[settings.adv_opt])
end)

menu.divider(root, 'Aditional Settings')
menu.toggle(root, 'Ignore Friends', {'fbignorefr'}, 'Future Blacklist ignore friends', function(val)
    settings.ignore_friends = val
end, settings.ignore_friends)

--[[
	****************************************************************

	Developer Mode

	****************************************************************
]]
menu.divider(admin_tab, 'Developer Settings')
menu.text_input(admin_tab, "Insert Api Key", {'Future5_api_key'}, "", function(val) script.developer_key = val util.toast('[Dev] Developer Key added '..val) end, script.developer_key)
menu.toggle(admin_tab, 'Scan All', {''}, 'Scan All', function(val)
    devs.scan_all = val
end, devs.scan_all)
menu.toggle(admin_tab, 'Scan For Modders', {''}, 'Scan Modders', function(val)
    devs.scan_modders = val
end, devs.scan_modders)
menu.toggle(admin_tab, 'Scan For Advertisers', {''}, 'Scan Advertisers', function(val)
    devs.scan_advertisers = val
end, devs.scan_advertisers)
menu.divider(admin_tab, '')
menu.toggle(admin_tab, 'Debug HTTP/S', {''}, '', function(val)
    devs.debug_http = val
end, devs.debug_http)
menu.list_select(admin_tab, "Block Join Mode", {}, "", devs.block_joinm, devs.block_joinm_opt, function(val) 
	devs.block_joinm_opt = val
	util.toast('[Dev] Reaction Mode '..devs.block_joinm[devs.block_joinm_opt])
end)
menu.divider(admin_tab, "Testing")
menu.action(admin_tab, "Add Player", {},"", function() 
	local res = functions.api_add_player("111111111", "name", "1.1.1.1", "Normal+player.",0)
	util.toast('[Dev] Response '..tostring(res))
end)
menu.action(admin_tab, "Get Player", {},"", function() 
	local res = functions.api_get_player("111111111")
	util.toast('[Dev] Response '..tostring(res))
end)
menu.action(admin_tab, "Exist Player", {},"", function() 
	local res = functions.api_player_exists("111111111")
	util.toast('[Dev] Response '..tostring(res))
end)

--[[
	****************************************************************
]]

function checkSessionForModdersOrAdmins()
	for _, pid in ipairs(players.list(false, not settings.ignore_friends, true)) do
		if (players.is_marked_as_modder_or_admin(pid) and script.detection_limiter[pid]['modder'] == true) then
			local rid = players.get_rockstar_id(pid)
			local name = players.get_name(pid)
			local ip = functions.to_ipv4(players.get_connect_ip(pid))
			local result = functions.api_get_player(rid)
			
			if (players.is_marked_as_modder(pid)) then
				local res = functions.api_add_player(rid, name, ip, "Stand+modder+detection.", 1)
				if res ~= nil then
					util.toast('[Dev]  '..res)
				end
			elseif (players.is_marked_as_admin(pid)) then
				local res = functions.api_add_player(rid, name, ip, "Stand+admin+detection.", 1)
				if res ~= nil then
					util.toast('[Dev]  '..res)
				end
			end
			util.toast('[Dev] Sending request to add modder '..name)
			script.detection_limiter[pid]['modder'] = true
		end
	end
end

--[[
	****************************************************************
]]
players.on_join(function(pid) 
	if players.user() == pid then return end
	script.detection_limiter[pid] = {
        ['modder'] = false,
        ['advertiser'] = false
    }
	checkSessionForModdersOrAdmins() -- Check all player by looping through all of them 
	if settings.ignore_friends == true and NETWORK.NETWORK_IS_FRIEND(functions.pid_to_handle(pid)) then return end
	local rid = players.get_rockstar_id(pid)
	local name = players.get_name(pid)
	local ip = functions.to_ipv4(players.get_connect_ip(pid))
	local modder = players.is_marked_as_modder_or_admin(pid)
	local result = functions.api_get_player(rid)
	if(result == 1 and settings.check_modders == true) or (result == 2 and settings.check_advertisers == true) then
		util.toast('[Dev] Appliying reaction to '..name)
		functions.player_join_reaction(pid, result)
	end
	-- util.yield(2000)
	if script.developer_key ~= '' then
		util.toast('[Dev] Sending request to add '..name)
		functions.api_add_player(rid, name, ip, modder == true and "Stand+modder+detection." or "Normal+player.", modder == true and 1 or 0)
	end
end)
-- players.dispatch_on_join() -- Calls your join handler(s) for every player that is already in the session.
players.on_leave(function(pid) 
    script.detection_limiter[pid] = { -- reset to avoid errors
        ['modder'] = false,
		['advertiser'] = false,
    }
end)