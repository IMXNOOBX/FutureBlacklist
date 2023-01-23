exports.index = function (req, res) {
    let path = req.app.get('path');
    let fs = req.app.get('fs');
    let cheerio = req.app.get('cheerio');
    let database_stats = req.app.get('db_stats');
    console.log(database_stats)
    fs.readFile('public/html/index.html', 'utf8', function(err, data) {
        if (err) throw err;
        var $ = cheerio.load(data);
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

    // console.log(user)
    // if(/^\d+$/.test(user)) 

    var data = {
        name: "paco",
        rid: 2112331312,
        note: "adsa adasd ad as d asd a",
        modder: false,
        advertiser: false,
        last_seen: "idk",
        first_seen: "long ago"
    }

    // db.query(`SELECT * FROM PLAYERS WHERE ${/^\d+$/.test(user) ? 'rid=' + user : 'name=' + user}`, function (error, data, fields) {
		// if(data.length == 0) {
        //     return res.sendFile(path.resolve('public/html/user.html'))
        // }
        // data = data[0];
        fs.readFile('public/html/user.html', 'utf8', function(err, file) {
            if (err) throw err;
            var $ = cheerio.load(file);

            // console.log($('meta[property="og:title"]').attr('content'))

            $('.player-info').css('display','block');
            $('.error-noexist').css('display','none');
            $('#player-name').text(data.name);
            $('#player-rid').text(data.rid);
            $('#player-note').text(data.note);
            $('#player-modder').text(data.modder);
            $('#player-advertiser').text(data.advertiser);
            $('#player-last-seen').text(data.first_seen);
            $('#player-first-seen').text(data.last_seen);
            // console.log($.html());
            return res.send($.html())
        // });

    });

    // res.sendFile(path.resolve('public/html/index.html'))
};