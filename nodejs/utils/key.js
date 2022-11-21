module.exports = async function(db, key) {
    db.query(`SELECT discord_id FROM USER WHERE key_auth='${key}' LIMIT 0, 1`, (res, msg) => {
        // console.log(res[0].discord_id)
        // console.log(msg)
        // console.log(res?.length)
        return res?.length == 0 ? false : res[0].discord_id
    });
}