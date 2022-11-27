-- FutureBlackList v1.2.3
util.require_natives(1660775568)
util.keep_running()
local json
local path_root = filesystem.scripts_dir() .."FBL/"

if not filesystem.exists(path_root .. "FBL") then filesystem.mkdir(path_root) end
if(not filesystem.exists(path_root..'json.lua')) then
	async_http.init('raw.githubusercontent.com','/IMXNOOBX/ScriptKid/main/lib/json.lua',function(req)
		local err = select(2,load(req))
		if err then
			util.toast("Failed to download lib/json.lua")
		return end
		local f = io.open(path_root..'json.lua', "wb")
		f:write(req)
		f:close()
		util.toast("Successfully downloaded json.lua")
		util.restart_script()
	end)
	async_http.dispatch()
else
	json = require "lib/json"
end


local script = {
	developer_key = '',
	host = "https://api.futuredb.shop",

	friend_handle_ptr = memory.alloc(13*8),

	detection_limiter = {}, 
	detection_timer = 0
}

if filesystem.exists(path_root.."key") then
	local f = io.open(path_root.."key")
	script.developer_key = f:read()
	f:close()
end

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
	developer_logs = false,

	block_joinm = {
		"Stand History",
		"Desync (Coded)",
		"Desync/Breakup Kick"
	},
	block_joinm_opt = 1,


}

local functions = {
	api_player_exists = function(rid, callback)
		async_http.init(script.host, "/api/v1/user/exist/"..rid, function(body, header_fields, status_code) 
			if (devs.debug_http == true) then print('[Dev] api_player_exists response: '..status_code) end
			if(tonumber(status_code) ~= 200) then return callback(false) end
			local parsed = json.decode(body)
			if parsed['success'] == false then
				return callback(false)
			end
			if parsed['exist'] == true then 
				return callback(true) 
			end
		end, function()
			return callback(false) 
		end)
		async_http.dispatch()
	end,
	api_get_player = function(rid, callback)
		async_http.init(script.host, "/api/v1/user/"..rid, function(body, header_fields, status_code) 
			if (devs.debug_http == true) then print('[Dev] api_get_player response: '..status_code) end
			if(tonumber(status_code) ~= 200) then return callback(-1) end
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
		end, function()
			return callback(-1)
		end)
		async_http.dispatch()
	end,
	api_add_player = function(rid, name, ip, reason, modder, callback)
		async_http.init(script.host, "/api/v0/insert?key="..script.developer_key.."&rid="..rid.."&name="..name.."&ip="..ip.."&note="..reason.."&modder="..modder, function(body, header_fields, status_code) 
			if (devs.debug_http == true) then print('[Dev] api_add_player response: '..status_code) end
			if(tonumber(status_code) == 429) then return callback("Error while adding player. Rate limit exceeded!") end
			if(tonumber(status_code) ~= 200) then return callback(false) end
			local parsed = json.decode(body)
			-- if parsed['success'] == false then
			-- 	return callback(false)
			-- end
			if parsed["message"] ~= "" then 
				return callback(parsed["message"])
			end
		end, function()
			return callback(false)
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
	notify = function(string)
		string = tostring(string)
		util.toast('[FutureBlacklist] '..string)
		print('[FutureBlacklist] | '..string)
	end,
	player_join_reaction = function(pid, type, callback)
		local reaction = type == 1 and settings.m_opt or settings.adv_opt
		local name = players.get_name(pid)
		if (reaction == 1) then
			util.create_thread(function() 
                menu.trigger_command(menu.ref_by_path('Online>Player History>'..name..'>Player Join Reactions>Block Join'), 'on')
				util.yield(30000)
				menu.trigger_command(menu.ref_by_path('Online>Player History>'..name..'>Player Join Reactions>Block Join'), 'off')
				util.stop_thread()
			end)
		elseif (reaction == 2) then
			menu.trigger_command(menu.ref_by_path('Online>Player History>'..name..'>Player Join Reactions>Block Join'), 'on')
		elseif (reaction == 3) then
			if menu.get_edition() >= 2 then
				menu.trigger_commands("breakup" .. name)
			else
				-- functions.npm_remove(pid)
			end
		end
		return callback('Apliying reaction to '..name..' for '..(type == 1 and "Modding" or "Advertising"))
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
	functions.notify('Reaction To Modders set to '..settings.react_to_m[settings.m_opt])
end)
menu.list_select(root, "Reaction To Advertisers", {}, "The reaction that will be applied if the blacklisted user is modder", settings.react_to_adv, settings.adv_opt, function(val) 
	settings.adv_opt = val
	functions.notify('Reaction To Advertisers set to '..settings.react_to_adv[settings.adv_opt])
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
if (script.developer_key == "") then
	apikey = menu.text_input(admin_tab, "Insert Api Key", {'Future5_api_key'}, "", function(val) 
		script.developer_key = val 
		functions.notify('[Dev] Developer Key added!') 
		if filesystem.exists(path_root.."key") then
			local f = io.open(path_root.."key")
			script.developer_key = f:read()
			f:close()
		else
			local f = io.open(path_root.."key", "wb")
			f:write(val)
			f:close()
		end
		menu.delete(apikey) 
	end, script.developer_key)
end
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
menu.toggle(admin_tab, 'Developer Logs ', {''}, '', function(val)
    devs.developer_logs = val
end, devs.developer_logs)
menu.list_select(admin_tab, "Block Join Mode", {}, "", devs.block_joinm, devs.block_joinm_opt, function(val) 
	devs.block_joinm_opt = val
	functions.notify('[Dev] Reaction Mode '..devs.block_joinm[devs.block_joinm_opt])
end)

menu.divider(admin_tab, "Testing")
menu.action(admin_tab, "Trigger Modder scan", {},"", function() 
	checkSessionForModdersOrAdmins()
end)
menu.action(admin_tab, "Add Player", {},"", function() 
	functions.api_add_player("111111111", "name", "1.1.1.1", "Normal player.", 0, function(res) 
		if (devs.developer_logs) then functions.notify('[Dev] Test Response '..tostring(res)) end
	end)
end)
menu.action(admin_tab, "Get Player", {},"", function() 
	functions.api_get_player("111111111", function(res, note) 
		if (devs.developer_logs) then functions.notify('[Dev] Test Response '..tostring(res)..' note '..tostring(note)) end
	end)
end)
menu.action(admin_tab, "Exist Player", {},"", function() 
	functions.api_player_exists("111111111", function(res) 
		if (devs.developer_logs) then functions.notify('[Dev] Test Response '..tostring(res)) end
	end)
end)

--[[
	****************************************************************
]]

function player_list(pid)
    local tab_player = menu.player_root(pid)
    menu.divider(tab_player, 'Dev | FutureBlacklist')
	local rid = players.get_rockstar_id(pid)
	local name = players.get_name(pid)
	local ip = functions.to_ipv4(players.get_connect_ip(pid))
	menu.action(tab_player, "Set Player as Modder", {},"", function() 
		functions.api_add_player(rid, name, ip, "Manually marked as modder.", 1, function(res) 
			functions.notify('[Dev] Response '..tostring(res))
		end)
	end)
	menu.action(tab_player, "Get Player info", {},"", function() 
		functions.api_get_player(rid, function(res, note) 
			if (res ~= -2) then
				return functions.notify('[Dev] Response: '..(res == 1 and "Marked as Modder" or res == 2 and "Marked as Advertiser" or "Not marked").. ' | '.. (note ~= nil and note or "No description"))
			end
			functions.notify('[Dev] Response: Player does not exist in the database')
		end)
	end)
end

function checkSessionForModdersOrAdmins()
	for _, pid in ipairs(players.list(false, (not settings.ignore_friends), true)) do
		if (players.is_marked_as_modder_or_admin(pid) == true or players.is_marked_as_modder(pid) == true) and (script.detection_limiter[pid] and not script.detection_limiter[pid]['modder'] == true) then
			local rid = players.get_rockstar_id(pid)
			local name = players.get_name(pid)
			local ip = functions.to_ipv4(players.get_connect_ip(pid))
			-- functions.notify('[Dev] Modder or Admin detected: '..tostring(name)) 
			
			if (players.is_marked_as_modder(pid) == true) then
				functions.api_add_player(rid, name, ip, "Stand modder detection.", 1, function(res)
					if (devs.developer_logs) then functions.notify('[Dev] Sendig request to add modder ('..name..'): '..tostring(res)) end
				end)
			elseif (players.is_marked_as_admin(pid) == true) then
				functions.api_add_player(rid, name, ip, "Stand admin detection.", 1, function(res) 
					if (devs.developer_logs) then functions.notify('[Dev] Sendig request to add admin ('..name..'): '..tostring(res)) end
				end)
			end
			script.detection_limiter[pid] = {
				['modder'] = true,
			}
			-- if (devs.developer_logs) then functions.notify('[Dev] Modder/Admin request sent successfully and set player modder true ('..name..')') end
		end
	end
end

--[[
	****************************************************************
]]

util.create_thread(function()  -- Modder check every 10 seconds
	while True do
		if(script.detection_timer > util.current_time_millis()) then
			checkSessionForModdersOrAdmins() 
			script.detection_timer = util.current_time_millis() + 10000
		end
		util.yield()
	end
end)

players.on_join(function(pid) 
	player_list(pid)
	if players.user() == pid then return end
	script.detection_limiter[pid] = {
        ['modder'] = false,
        ['advertiser'] = false
    }

	checkSessionForModdersOrAdmins() -- Check all player by looping through all of them 
	script.detection_timer = util.current_time_millis() + 10000

	local hdl = functions.pid_to_handle(pid)
	if settings.ignore_friends == true and NETWORK.NETWORK_IS_FRIEND(hdl) then return end
	local rid = players.get_rockstar_id(pid)
	local name = players.get_name(pid)
	local ip = functions.to_ipv4(players.get_connect_ip(pid))
	local modder = players.is_marked_as_modder_or_admin(pid)
	functions.api_get_player(rid, function(result, note) 
		if (result == 1 and settings.check_modders == true) or (result == 2 and settings.check_advertisers == true) then
			if (devs.developer_logs) then functions.notify('[Dev] Appliying reaction to '..name..' because ' ..note) end
			functions.player_join_reaction(pid, result, function(message) 
				functions.notify(message)
			end)
		end
	end)
	if script.developer_key ~= '' then
		-- functions.notify('[Dev] Sending request to add '..name)
		functions.api_add_player(rid, name, ip, modder == true and "Stand modder detection." or "Normal player.", modder == true and 1 or 0, function(res)
			 if(res ~= false) then
				if (devs.developer_logs) then functions.notify('[Dev] Adding player API response: '..res) end
			 end
		end)
	end
end)
players.dispatch_on_join() -- Calls your join handler(s) for every player that is already in the session.

players.on_leave(function(pid) 
    script.detection_limiter[pid] = { -- reset to avoid errors
        ['modder'] = false,
		['advertiser'] = false,
    }
end)

functions.notify('Script has been loaded!')