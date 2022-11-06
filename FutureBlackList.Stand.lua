-- FutureBlackList v1.0.0
util.require_natives(1660775568)
util.keep_running()

local functions = {
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


menu.divider(menu.my_root(), 'FutureBlackList')
menu.action(menu.my_root(), "Check Player", {}, "", function()
	util.toast('Sending request')
    async_http.init("127.0.0.1", "/api/v1/user/218321285", function(body) 
		util.toast('success')   
		print(body)
	end, function() 
		util.toast('Error')   
	end)
	async_http.dispatch()
	util.toast('Finished')
end)