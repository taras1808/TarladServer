const User = require('./models/User')
const Message = require('./models/Message')
const Chat = require('./models/Chat')
const jwt = require('jsonwebtoken');

module.exports = (http) => {
    const io = require('socket.io')(http)

    io.use((socket, next) => {
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
    });

    io.on('connect', socket => {

        socket.on('join', (msg) => {
            // socket.join('u' + socket.user.userId)
            socket.join(msg)
            // User.relatedQuery('chats')
            //     .for(socket.user.userId)
            //     .select('id')
            //     .then(chats => {
            //         for(let chat of chats){
            //             socket.join(chat.id)
            //         }
            //     })
        })

        socket.on('messages', (msg, callback) => {
            var message = {
                chat_id: msg.chatId,
                user_id: socket.user.userId,
                data: msg.data,
                type: msg.type,
                time: msg.time 
            }
            Message.query()
                .insert(message)
                .then(data => {
                    socket.broadcast.to(data.chat_id).emit('message', data)
                    callback(data)
                }).catch(err =>
                    console.log(err)
                )
        })

        socket.on('api/chats/messages/last', async (callback) => {
            const chats = await User.relatedQuery('chats')
                .for(socket.user.userId)

            const result = []
                
            for(let chat of chats){
                const messages = await Chat.relatedQuery('messages')
                    .for(chat)
                    .orderBy('time', 'desc')
                    .limit(1)

                if (messages.length > 0) {
                    chat.message = messages[0]
                    result.push(chat)
                }
            }
            callback(result)
        })
    })

    return io;
}