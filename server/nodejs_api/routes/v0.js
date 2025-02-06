// fix sql injection
exports.get_user = function (req, res) {
    let db = req.app.get('db');
    let rid = req.params.rid
    let key = req.query.key

    if (!key)
        return res.send({
            message: "",
            success: false
        })
    db.query(`SELECT * FROM USER WHERE key_auth='${key}' LIMIT 0, 1`, (asw, msg) => { // async response
        if (asw?.length == 0)
            return res.send({
                message: "",
                success: false
            })

        db.query(`SELECT * FROM PLAYERS WHERE rid=${rid}`, (asw, msg) => {

            if (asw?.length == 0)
                return res.send({
                    message: "Player doesn't exist in the database.",
                    success: false,
                })

            asw = asw[0]
            return res.send({
                data: {
                    rockstar_id: asw.rid,
                    rockstar_name: asw.name,
                    last_playerip: asw.ip,
                    player_note: asw.note,
                    is_modder: asw.modder == 1 ? true : false,
                    advertiser: asw.advertiser == 1 ? true : false,
                    risk: asw.risk,
                    whitelist: asw.whitelist,
                    times_seen: asw.times_seen,
                    last_seen: asw.last_seen,
                    first_seen: asw.first_seen,
                    added_by: asw.added_by
                },
                message: "Succesfully retrieved data from the database.",
                success: true,
            })
        });
    });
};

exports.insert = async function (req, res) {
    var db = req.app.get('db');
    var config = req.app.get('config');
    let key = req.query.key
    let rid = req.query.rid
    let name = req.query.name
    let ip = req.query.ip
    let note = req.query.note
    let modder = (req.query.modder && (req.query.modder.toLowerCase() == "true" || req.query.modder.toLowerCase() == "1")) ? 1 : 0
    let advertiser = (req.query.advertiser && (req.query.advertiser.toLowerCase() == "true" || req.query.advertiser.toLowerCase() == "1")) ? 1 : 0
    let risk = (req.query.risk && req.query.risk > 0 && req.query.risk < 4) ? req.query.risk : 0
    let date = Date.now();
    let fseen = req.query.firstseen || date

    if (!key)
        return res.send({
            message: "",
            success: false
        })

    db.query(`SELECT discord_id FROM USER WHERE key_auth='${key}' LIMIT 0, 1`, (asw, msg) => {
        if (asw?.length == 0)
            return res.send({
                message: "",
                success: false,
            })
        let uploader_id = asw[0].discord_id

        if (rid == null || name == null || uploader_id == null)
            return res.send({
                message: "",
                success: false,
            })

        db.query(`UPDATE USER SET ip='${req.ip}' WHERE key_auth='${key}'`, (asw, msg) => {
            if (msg != null)
                console.log(msg)
        })
        db.query(`SELECT * FROM PLAYERS WHERE rid=${rid}`, (asw, msg) => {
            if (asw?.length == 0) {
                db.query(`INSERT INTO PLAYERS (rid, name, ip, note, modder, advertiser, risk, last_seen, first_seen, added_by) VALUES (${rid}, '${name}', '${ip}', '${note}', ${modder}, ${advertiser}, ${risk}, '${date}', '${fseen || date}', ${uploader_id})`, (asw, msg) => {
                    if (msg != null) {
                        return res.send({
                            message: `Error adding ${name}`,
                            error: config.debug ? msg : null,
                            success: false
                        })
                    }

                    return res.send({
                        message: `Added ${name} successfully`,
                        success: true
                    })
                });
            } else if (modder == 1) {
                db.query(`UPDATE PLAYERS SET ip='${ip}', times_seen = times_seen+1, last_seen='${date}', note='${note}', modder='${modder}' WHERE rid=${rid}`, (asw, msg) => {
                    if (msg != null)
                        return res.send({
                            message: `Error updating modder ${name}`,
                            error: config.debug ? msg : null,
                            success: false
                        })

                    return res.send({
                        message: `Player ${name} already exists, Updating to modder status!`,
                        success: true
                    })
                });
            } else if (advertiser == 1) {
                db.query(`UPDATE PLAYERS SET ip='${ip}', times_seen = times_seen+1, last_seen='${date}', note='${note}', advertiser='${advertiser}' WHERE rid=${rid}`, (asw, msg) => {
                    if (msg != null)
                        return res.send({
                            message: `Error updating advertiser ${name}`,
                            error: config.debug ? msg : null,
                            success: false
                        })

                    return res.send({
                        message: `Player ${name} already exists, Updating to advertiser status!`,
                        success: true
                    })
                });
            } else {
                db.query(`UPDATE PLAYERS SET ip='${ip}', times_seen = times_seen+1, last_seen='${date}' WHERE rid=${rid}`, (asw, msg) => {
                    if (msg != null) {
                        return res.send({
                            message: `Error updating player ${name}`,
                            error: config.debug ? msg : null,
                            success: false
                        })
                    }

                    return res.send({
                        message: `Player ${name} already exists, Updating player status!`,
                        success: true
                    })
                });
            }
        });
    });
};