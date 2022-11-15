-- FutureBlackList v1.0.0
util.require_natives(1660775568)
util.keep_running()
local json = require "lib/json"

local developer_key = ''

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

	friend_handle_ptr = memory.alloc(13*8)
}

local functions = {
	api_player_exists = function(rid)
		async_http.init("http://panel.imxnoobx.xyz:4000", "/api/v1/user/exist/"..rid, function(body, header_fields, status_code) 
			if(status_code ~= 200) then return false end
			local parsed = json.decode(body)
			if parsed['exist'] == true then 
				return true 
			end
		end, function()
			return false 
		end)
		async_http.dispatch()
	end,
	api_get_player = function(rid)
		async_http.init("http://panel.imxnoobx.xyz:4000", "/api/v1/user/"..rid, function(body, header_fields, status_code) 
			if(status_code ~= 200) then return false end
			local parsed = json.decode(body)
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
		async_http.init("http://panel.imxnoobx.xyz:4000", "/api/v0/insert?key="..developer_key.."&rid="..rid.."&name="..name.."&ip="..ip.."&note="..reason.."&modder="..modder, function(body, header_fields, status_code) 
			if(status_code ~= 200) then return false end
			local parsed = json.decode(content)
			if parsed["message"] ~= "" then 
				return parsed["message"] 
			end
		end, function()
			return false 
		end)
		async_http.dispatch()
	end,
	-- local function pid_to_handle(pid) -- Credits: lancescript_reloaded
	-- 	NETWORK.NETWORK_HANDLE_FROM_PLAYER(pid, handle_ptr, 13)
	-- 	return handle_ptr
	-- end
	is_friend = function(pid)
		NETWORK.NETWORK_HANDLE_FROM_PLAYER(pid, settings.friend_handle_ptr, 13)
		return NETWORK.NETWORK_IS_FRIEND(settings.friend_handle_ptr)
	end,
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
local devs = {
	scan_all = true,
	scan_modders = true,
	scan_advertisers = true,

	debug_http = false,

	block_joinm = {
		"Stand History",
		"Desync (Coded)",
		"Desync / Breakup"
	},
	block_joinm_opt = 1,
}
menu.text_input(admin_tab, "Insert Api Key", {'Future5_api_key'}, "", function(val) developer_key = val util.toast('[Dev] Developer Key added '..val) end, developer_key)
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







--[[
	****************************************************************
]]
players.on_join(function(pid) 
	if players.user() == pid then return end
	if settings.ignore_friends == true and funtions.is_friends(pid) then return end


end)
-- players.dispatch_on_join() -- Calls your join handler(s) for every player that is already in the session.