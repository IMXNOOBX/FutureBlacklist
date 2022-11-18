exports.get_user = function(req, res) {
    var db = req.app.get('db');
    res.send({
        params: req.params.rid,
        success: true,
    })
};

exports.insert = function(req, res) {
    var db = req.app.get('db');
    let key = req.query.key
    let rid = req.query.rid
    let name = req.query.name
    let ip = req.query.ip
    let note = req.query.note
    let modder = (req.query.modder && (req.query.modder.toLowerCase() == "true" || req.query.modder.toLowerCase() == "1")) ? 1 : 0
    let advertiser = (req.query.advertiser && (req.query.advertiser.toLowerCase() == "true" || req.query.advertiser.toLowerCase() == "1")) ? 1 : 0
    let risk = req.query.risk
    let date = Date.now();
    
    res.send({
        params: req.params.rid,
        success: true,
    })
};