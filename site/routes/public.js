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
        res.send($.html())
    });

    // res.sendFile(path.resolve('public/html/index.html'))
};


exports.user = function (req, res) {
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
        res.send($.html())
    });

    // res.sendFile(path.resolve('public/html/index.html'))
};