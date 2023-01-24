const blankLine = " ".repeat(20)

exports.index = function (req, res) {
    let path = req.app.get('path');
    let fs = req.app.get('fs');
    let cheerio = req.app.get('cheerio');
    let database_stats = req.app.get('db_stats');
    // console.log(database_stats)
    fs.readFile('public/html/index.html', 'utf8', function(err, data) {
        if (err) throw err;
        var $ = cheerio.load(data);
        var normalDesc = $("meta[property='og:description']").attr("content")
        
         $("meta[property='og:description']").attr("content", normalDesc + " Total Players: "+database_stats.total_players + ", Total Modders: "+database_stats.modder_players + ", Total Advertisers: "+database_stats.advertiser_players)
        
        $('#total-players').text(database_stats.total_players);
        $('#legit-players').text(database_stats.legit_players);
        $('#modder-players').text(database_stats.modder_players);
        $('#advertiser-players').text(database_stats.advertiser_players);
        // console.log($.html());
        return res.send($.html())
    });

    // res.sendFile(path.resolve('public/html/index.html'))
};


exports.user = function (req, res) {
    let path = req.app.get('path');
    let fs = req.app.get('fs');
    let cheerio = req.app.get('cheerio');
    let db = req.app.get('db');
    let user = req.params.user

    let cookie_key = req.cookies['cookie_key'] || "NULL";
    
    db.query(`SELECT * FROM PLAYERS WHERE ${/^\d+$/.test(user) ? 'rid=' + user : 'name=\'' + user + '\''}`, function (error, data, fields) {
        // console.log(data)
        if(data?.length == 0 || data[0].whitelist == 1) {
            return res.sendFile(path.resolve('public/html/user.html'))
        }
        data = data[0];
        if(cookie_key) {
            db.query(`SELECT discord_id FROM USER WHERE key_auth='${cookie_key}' LIMIT 0, 1`, function (error, userid, fields) {
                fs.readFile('public/html/user.html', 'utf8', function(err, file) {
                    if (err) throw err;
                    var $ = cheerio.load(file);
        
                    $("meta[property='og:title']").attr("content", "FutureDB | "+ data.name)
                    $("meta[property='og:description']").attr("content", "Find more about "+data.name+" in the site. Username: "+ data.name + ", SCID: "+ data.rid+ ", Last Seen: "+ Date(data.last_seen))
        
                    $('.player-info').css('display','block');
                    $('.error-noexist').css('display','none');
                    $('#player-name').text(data.name);
                    $('#player-rid').text(data.rid);
                    if(userid?.length > 0) $('#player-data1').text("IP Address: "+ data.ip); else $('#player-data1').css('display','none');
                    $('#player-note').text(data.note);
                    $('#player-modder').text(data.modder == 1 ? "Yes" : "No");
                    $('#player-modder').css('color',data.modder == 1 ? "red" : "green");
                    $('#player-advertiser').text(data.advertiser == 1 ? "Yes" : "No");
                    $('#player-advertiser').css('color',data.advertiser == 1 ? "red" : "green");
                    if(userid?.length > 0)  $('#player-data2').text("Times Seen: "+ data.times_seen); else $('#player-data2').css('display','none');
                    $('#player-last-seen').text(new Date(new Number(data.last_seen)));
                    $('#player-first-seen').text(new Date(new Number(data.first_seen)));
                    if(userid?.length > 0)  $('#player-data3').text("Added By: "+ data.added_by); else $('#player-data3').css('display','none');
                    // console.log($.html());
                    return res.send($.html())
                });
            });
        }
    });


    // res.sendFile(path.resolve('public/html/index.html'))
};

exports.set_cookie = function (req, res) {
    // let path = req.app.get('path');
    // let fs = req.app.get('fs');
    // let cheerio = req.app.get('cheerio');
    // let db = req.app.get('db');
    let key = req.params.key

    if(!key && key?.length < 20 && key?.length > 70) {
        return res.send({
            success: false,
            message: "Invalid key Type."
        })
    }
    res.cookie('cookie_key', key, {
        maxAge: 30 * 86400 * 1000, // 30 days
        httpOnly: true, // http only, prevents JavaScript cookie access
        secure: true // cookie must be sent over https / ssl
    });
    return res.send({
        success: true,
        message: "Cookie set succesfully."
    })
};
