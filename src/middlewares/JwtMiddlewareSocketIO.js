const jwt = require('jsonwebtoken')

module.exports = (socket, next) => {
    const authHeader = socket.handshake.headers.authorization
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, "yt6r5478rt87god938gf9h34f3", (err, payload) => {
            if (err) {
                return next(new Error('token'))
            }
            socket.user = payload.user
            return next()
        })
    } else {
        return next(new Error('authentication'))
    }
}
