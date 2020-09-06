const User = require('./models/User')
const Message = require('./models/Message')
const Chat = require('./models/Chat')
const jwt = require('jsonwebtoken')
var fs = require('fs')
var sizeOf = require('image-size');

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
            socket.leaveAll()
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

        

        socket.on('chats', async (chatId, callback) => {

            const chat = await Chat.query()
                .findOne('id', chatId)
        
            chat.users = await Chat.relatedQuery('users')
                .for(chat)
                .select('id', 'nickname', 'name', 'surname', 'image_url')

            callback(chat)
        })

        socket.on('chats/create', async (data, callback) => {
            const userId = socket.user.userId

            const usersIds = JSON.parse(data)

            if (usersIds.length < 1 || usersIds.length > 63) {
                return
            }
        
            const chats = await User.relatedQuery('chats')
                .for(userId)
        
            if (usersIds.includes(userId)) {
                return
            }

            usersIds.push(userId)
        
            const users = []
        
            for (let userId of usersIds) {
                const user = await User.query()
                    .findOne('id', userId)
                    .select('id', 'nickname', 'name', 'surname', 'image_url')
                users.push(user)
            }
        
            for (let chat of chats) {
        
                const usersIdsForChat = await Chat.relatedQuery('users')
                    .for(chat)
                    .select('id')
        
                if (arraysEqual(usersIdsForChat.map(e => e.id), usersIds)) {
                    callback({ ...chat, users})
                    return;
                }
            }
        
            const chat = await Chat.query().insert({ title: null, user_id: socket.user.userId })
        
            for (let userId of usersIds) {
                io.to('u' + userId).emit('join', userId)
                await Chat.relatedQuery('users')
                    .for(chat)
                    .relate(userId);
            }

            callback({ ...chat, users })
        })

        socket.on('chats/title', async (chatId, title, callback) => {

            var checkChat = await Chat.relatedQuery('users')
                .for(Chat.query().findOne('id', chatId))
                .where('user_id', socket.user.userId)

            if (checkChat.length == 0) {
                callback()
                return
            }

            if (title.length == 0) {
                title = null
            }

            var chat = await Chat.query()
                .findById(chatId)
                .patchAndFetchById(chatId, {title})

            io.to(chatId).emit('chats/update', chat.id)

            callback(chat)
        })





        socket.on('chats/users/search', (chatId, q, page, callback) => {
            const chat = Chat.query()
                .where('id', chatId)

            User.query()
                .select('id', 'nickname', 'name', 'surname', 'image_url')
                .where('nickname', 'like', q + '%')
                .whereNotIn('id',
                    Chat.relatedQuery('users')
                        .for(chat)
                        .select('user_id')
                )
                .whereNot('id', socket.user.userId)
                .page(page, 10)
                .orderBy('id')
                .then(data => {
                    callback(data.results)
                })
        })

        socket.on('chats/users/add', async (chatId, data, callback) => {

            var checkChat = await Chat.relatedQuery('users')
                .for(Chat.query().findOne('id', chatId))
                .where('user_id', socket.user.userId)

            if (checkChat.length == 0) {
                callback()
                return
            }

            const usersIds = JSON.parse(data)

            const chat = await Chat.query()
                .findOne('id', chatId)
        
            for (let userId of usersIds) {
                io.to('u' + userId).emit('join')
                io.to('u' + userId).emit('chats/update', chat.id)
                await Chat.relatedQuery('users')
                    .for(chat)
                    .relate(userId);
            }
            io.to(chatId).emit('chats/update', chat.id)

            callback(0)
        })

        socket.on('chats/users/delete', async (chatId, userId, callback) => {
            await Chat.relatedQuery('users')
                    .for(chatId)
                    .unrelate()
                    .where('user_id', userId);

            callback()
            io.to('u' + userId).emit('join')
            io.to(chatId).emit('chats/update', chatId)
        })
        

        socket.on('chats/messages/before', async (chatId, before, callback) => {

            var chat = await Chat.relatedQuery('users')
                .for(Chat.query().findOne('id', chatId))
                .where('user_id', socket.user.userId)

            if (chat.length == 0) {
                callback()
                return
            }

            Message.query()
                .where('chat_id', chatId)
                .where('time', '<', before)
                .orderBy('time', 'desc')
                .page(0, 10)
                .then(data => {
                    if (data.results) callback(data.results)
                    else callback([])
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
                result.push({id: chat.id, title: chat.title, userId: chat.user_id, message, users})
            }

            callback(result.sort((o1, o2) => o2.message.time - o1.message.time))
        })




        socket.on('users', (userId, callback) => {
            User.query()
                .select('id', 'nickname', 'name', 'surname', 'image_url')
                .findOne('id', userId)
                .then(data => callback(data))
        })

        socket.on('users/search', (q, page, callback) => {
            const userId = socket.user.userId
            User.query()
                .select('id', 'nickname', 'name', 'surname', 'image_url')
                .where('nickname', 'like', q + '%')
                .where('id', '!=', userId)
                .page(page, 10)
                .then(data => {
                    callback(data.results)
                })
        })

        socket.on('users/images', (image, callback) => {

            fs.writeFile('public/' + image.path, image.imageData, 'base64', async function(err) {
                if(err) return

                var user = await User.query()
                    .findById(socket.user.userId)
                    .patchAndFetchById(socket.user.userId, {image_url: 'http://192.168.1.114:3000/' + image.path})

                callback(user)
            }); 
            
        })

        socket.on('users/images/delete', async (callback) => {

            var user = await User.query()
                .findById(socket.user.userId)

            if (!user) return

            fs.unlink('public/' + user.image_url.split('/')[3], async function(err) {
                if(err) return

                var user = await User.query()
                    .findById(socket.user.userId)
                    .patchAndFetchById(socket.user.userId, {image_url: null})

                callback(user)
            })

        })


        socket.on('messages', async (msg, callback) => {

            var checkChat = await Chat.relatedQuery('users')
                .for(Chat.query().findOne('id',msg.chatId))
                .where('user_id', socket.user.userId)

            if (checkChat.length == 0) {
                callback()
                return
            }

            var message = {
                chat_id: msg.chatId,
                user_id: socket.user.userId,
                data: msg.data,
                type: msg.type,
                time: new Date().getTime()
            }
            Message.query()
                .insert(message)
                .then(data => {
                    callback(data)
                    io.to(data.chat_id).emit('message', data)
                })
        })

        socket.on('messages/edit', async (id, data, callback) => {
            var message = await Message.query()
                .patchAndFetchById(id, {data})
            callback(message)
            io.to(message.chat_id).emit('message/update', message)
        })

        socket.on('messages/delete', async (messageId) => {

            if (messageId == -1) return

            var chat = await Message.query()
                .select('chat_id')
                .where('id', messageId)
                
            if (chat.size == 0 || !chat[0]) return

            Message.query()
                .delete()
                .where('id', messageId)
                .then(_ => {
                    io.to(chat[0].chat_id).emit('message/delete', messageId)
                })
        })

        socket.on('messages/last', (chatId, callback) => {
            Message.query()
                .findOne('chat_id', chatId)
                .orderBy('time', 'DESC')
                .then(data => callback(data))
        })


        socket.on('images', (image, callback) => {
            fs.writeFile('public/' + image.path, image.imageData, 'base64', async function(err) {
                if(err) return
                sizeOf('public/' + image.path, function (_, dimensions) {
                    callback('{url: "http://192.168.1.114:3000/' + image.path + '", width: ' + dimensions.width + ', height: ' + dimensions.height + '}')
                })
            })
        })



        

    })

    return io;
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    a.sort()
    b.sort()
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}