const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, "yt6r5478rt87god938gf9h34f3", (err, payload) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = payload.user;
            next();
        });
    } else {
        return res.sendStatus(401);
    }
}
