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

        socket.on('join',() =>  {
            socket.join('u' + socket.user.userId)
            User.relatedQuery('chats')
                .for(socket.user.userId)
                .select('id')
                .then(chats => {
                    for(let chat of chats){
                        socket.join(chat.id)
                    }
                })
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
                    callback(data)
                    io.to(data.chat_id).emit('message', data)
                })
        })

        socket.on('chats/messages/last', async (time, page, callback) => {

            const chats = User.relatedQuery('chats')
                .for(socket.user.userId)

            const messages = await Chat.relatedQuery('messages')
                .max('id')
                .for(chats)
                .where('time', '<', time)
                .groupBy('chat_id')
                .page(page, 10)

            var result = []

            for (var m of messages.results) {
                const [value] = Object.values(m)
                var message = await Message.query().findOne('id', value)
                if (!message) continue
                var chat = await Chat.query().findOne('id', message.chat_id)
                var users = await Chat.relatedQuery('users')
                    .for(message.chat_id)
                    .select('id', 'nickname', 'name', 'surname', 'image_url')
                result.push({id: chat.id, title: chat.title, message, users})
            }

            callback(result)
        })

        socket.on('chats/last', (chatId, callback) => {
            Message.query()
                .findOne('chat_id', chatId)
                .orderBy('time', 'DESC')
                .page(0, 1)
                .then(data => callback(data))
        })

        socket.on("chats", async (chatId, callback) => {

            const userId = socket.user.userId

            const user = await User.query()
                .where('id', userId)
                .select('id')

            const chat = await Chat.query()
                .for(user)
                .where('id', chatId)
        
            chat[0].users = await Chat.relatedQuery('users')
                .for(chat[0])
                .select('id', 'nickname', 'name', 'surname', 'image_url')

            callback(chat[0])
        })

        socket.on("chats/messages/before", (chatId, before, page, callback) => {
            Message.query()
            .where('chat_id', chatId)
            .where('time', '<', before)
            .orderBy('time', 'desc')
            .page(page, 10)
            .catch(err => console.log(err))
            .then(data => callback(data.results))
        })

        socket.on("messages/delete", async (messageId) => {

            if (messageId == -1) return

            var chat = await Message.query()
                .select('chat_id')
                .where('id', messageId)

            if (chat.size == 0 || chat[0]) return
        
            Message.query()
                .delete()
                .where('id', messageId)
                .then(_ => {
                    io.to(chat[0].chat_id).emit('del', messageId)
                })
        })









        // UNUSED
        socket.on("chats/messages/after", (chatId, after, page, callback) => {
            Message.query()
                .where('chat_id', chatId)
                .where('time', '>', after)
                .orderBy('time', 'asc')
                .page(page, 5)
                .then(data => callback(data.results))
        })
    })

    return io;
}