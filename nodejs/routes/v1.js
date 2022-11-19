exports.exist = function (req, res) {
    let db = req.app.get('db');
    let rid = req.params.rid

    db.query(`SELECT * FROM PLAYERS WHERE rid=${rid} LIMIT 0, 1`, (asw, msg) => {
        return res.send({
            exist: asw?.length == 0 ? false : asw[0].whitelist == 1 ? false : true,
            success: true,
        })
    });
};

exports.get_user = function (req, res) {
    let db = req.app.get('db');
    let rid = req.params.rid

    db.query(`SELECT * FROM PLAYERS WHERE rid=${rid}`, (asw, msg) => {
        if (asw?.length == 0 || asw[0].whitelist == 1)
            return res.send({
                message: "Player doesnt exist in the database.",
                success: false,
            })

        asw = asw[0]
        return res.send({
            data: {
                rokcstar_id: asw.rid,
                rockstar_name: asw.name,
                player_note: asw.note,
                is_modder: asw.modder == 1 ? true : false,
                advertiser: asw.advertiser == 1 ? true : false,
                risk: asw.risk, 
                last_seen: asw.last_seen,
                first_seen: asw.first_seen
            },
            message: "Succesfully retrieved data from the database.",
            success: true,
        })
    });
};