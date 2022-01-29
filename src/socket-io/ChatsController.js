const User = require('../models/User')
const Message = require('../models/Message')
const Chat = require('../models/Chat')

exports.chats = (socket) => async (chatId, callback) => {
    var checkChat = await Chat.relatedQuery('users')
        .for(Chat.query().findOne('id', chatId))
        .where('user_id', socket.user.userId)
    if (checkChat.length == 0) {
        callback()
        return
    }
    const chat = await Chat.query()
        .findOne('id', chatId)
    callback(chat)
}

exports.chatsCreate = (socket) => async (data, callback) => {
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
    for (let chat of chats) {
        const usersIdsForChat = await Chat.relatedQuery('users')
            .for(chat)
            .select('id')
        if (arraysEqual(usersIdsForChat.map(e => e.id), usersIds)) {
            callback(chat)
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
    callback(chat)
}

exports.chatsTitle = (socket) => async (chatId, title, callback) => {
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
        .patchAndFetchById(chatId, { title })
    io.to(chatId).emit('chats/update', chat.id)
    callback(chat)
}

exports.chatsUsers = (socket) => async (chatId, callback) => {
    var checkChat = await Chat.relatedQuery('users')
        .for(Chat.query().findOne('id', chatId))
        .where('user_id', socket.user.userId)
    if (checkChat.length == 0) {
        callback()
        return
    }
    const chat = Chat.query()
        .where('id', chatId)
    Chat.relatedQuery('users')
        .for(chat)
        .select('id', 'nickname', 'name', 'surname', 'image_url')
        .then(data => {
            callback(data)
        })
}

exports.chatsUsersSearch = (socket) => (chatId, q, page, callback) => {
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
}

exports.chatsUsersAdd = (socket) => async (chatId, data, callback) => {
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
}

exports.chatsUsersDelete = async (chatId, userId, callback) => {
    await Chat.relatedQuery('users')
        .for(chatId)
        .unrelate()
        .where('user_id', userId);
    callback(0)
    io.to('u' + userId).emit('join')
    io.to(chatId).emit('chats/update', chatId)
}

exports.chatsMessagesBefore = (socket) => async (chatId, before, callback) => {
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
}

exports.chatsMessagesLast = (socket) => async (time, page, callback) => {
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
        result.push(message)
    }
    if (result.length > 0) callback(result.sort((o1, o2) => o2.time - o1.time))
    else callback()
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
