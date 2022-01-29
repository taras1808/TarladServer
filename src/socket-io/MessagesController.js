const Message = require('../models/Message')
const Chat = require('../models/Chat')

exports.messages = (socket) => async (msg, callback) => {
    var checkChat = await Chat.relatedQuery('users')
        .for(Chat.query().findOne('id', msg.chatId))
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
            io.to(data.chat_id).emit('messages', data)
        })
}

exports.messagesEdit = async (id, data, callback) => {
    var message = await Message.query()
        .patchAndFetchById(id, { data })
    callback(message)
    io.to(message.chat_id).emit('messages/update', message)
}

exports.messagesDelete = async (messageId) => {
    if (messageId == -1) return
    var chat = await Message.query()
        .select('chat_id')
        .where('id', messageId)
    if (chat.size == 0 || !chat[0]) return
    Message.query()
        .delete()
        .where('id', messageId)
        .then(_ => {
            io.to(chat[0].chat_id).emit('messages/delete', messageId)
        })
}

exports.messagesLast = (chatId, callback) => {
    Message.query()
        .findOne('chat_id', chatId)
        .orderBy('time', 'DESC')
        .then(data => {
            if (data) callback(data)
            else callback()
        })
}
