var sizeOf = require('image-size');

exports.save = async (req, res) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).end();
    }

    var file = req.files.pic

    if (!file) return res.status(400).end();
    
    var filename = file.name + "_" + new Date().getTime() + '.jpg'
    file.mv('public/uploads/' + filename, function(err) {
        if (err) return res.status(500).json(err)
        var path = 'http://' + req.hostname + ':' + req.socket.localPort + '/uploads/' + filename
        sizeOf('public/uploads/' + filename, function (_, dimensions) {
            res.json({url: path, width: dimensions.width, height: dimensions.height})
        })
    })
}