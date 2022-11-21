module.exports = async function(db, rid) {
    db.query(`SELECT * FROM PLAYERS WHERE rid=${rid} LIMIT 0, 1`, (res, msg) => {
        // console.log(res)
        // console.log(msg)
        console.log(res?.length)
        return res?.length == 0 ? false : true
    });
}