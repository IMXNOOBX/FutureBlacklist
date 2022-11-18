exports.exist = function(req, res) {
    let db = req.app.get('db');
    let par = req.params
    res.send({
        params: req.params.rid,
        success: true,
    })
};

exports.get_user = function(req, res) {
    let db = req.app.get('db');

    res.send({
        db,
        params: req.params.rid,
        success: true,
    })
};