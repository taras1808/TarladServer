const User = require('../models/User')
const Chat = require('../models/Chat')
const Message = require('../models/Message')

exports.create = async (req, res) => {
	if (!req.body.data) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
    }

    const userId = req.user.userId
    const usersIds = req.body.data

    if (usersIds.length < 1 || usersIds.length > 63) {
        res.status(400).send({ message: "Bad request" })
        return
    }

    const chats = await User.relatedQuery('chats')
        .for(userId)

    if (usersIds.includes(userId)) {
        res.status(400).send({ message: "Bad request" })
        return
    }
    
    usersIds.push(userId)

    const users = []

    for (let userId of usersIds) {
        const user = await User.query()
            .where("id", userId)
            .select('id', 'nickname', 'name', 'surname', 'image_url')
        users.push(user[0])
    }

    for (let chat of chats) {

        const usersIdsForChat = await Chat.relatedQuery('users')
            .for(chat)
            .select('id')

        if (arraysEqual(usersIdsForChat.map(e => e.id), usersIds)) {
            res.json({ ...chat, users})
            return;
        }
    }

    const chat = await Chat.query().insert({ title: null })

    for (let userId of usersIds) {
        // req.io.to('u' + userId).emit('join', userId)
        await Chat.relatedQuery('users')
            .for(chat)
            .relate(userId);
    }

    res.json({ ...chat, users })
}

exports.getChats = async (req, res) => {
    const userId = req.user.userId

    const user = await User.query()
        .where('id', userId)
        .select('id')

    const chats = await User.relatedQuery('chats')
        .for(user)

    for (let chat of chats) {
        chat.users = await Chat.relatedQuery('users')
            .for(chat)
            .select('id', 'nickname', 'name', 'surname', 'image_url')
    }

    res.json(chats);
}

exports.getChat = async (req, res) => {
    if (!req.params.chatId) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
    }

    const userId = req.user.userId

    const user = await User.query()
        .where('id', userId)
        .select('id')

    const chat = await Chat.query()
        .for(user)
        .where('id', req.params.chatId)

    chat[0].users = await Chat.relatedQuery('users')
        .for(chat[0])
        .select('id', 'nickname', 'name', 'surname', 'image_url')

    res.json(chat[0]);
}

exports.getMessagesInChat = async (req, res) => {
    if (!req.params.chatId) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
    }

    const chatId = req.params.chatId
    const after = req.query.after
    const before = req.query.before
    const page = req.query.page

    if (before) {
        Message.query()
            .where('chat_id', chatId)
            .where('time', '<', before)
            .orderBy('time', 'desc')
            .page(page, 10)
            .then(data =>
                res.json(data.results)
            ).catch(err =>
                res.send(err)
            )
    } else {
        Message.query()
            .where('chat_id', chatId)
            .where('time', '>', after)
            .orderBy('time', 'asc')
            .page(page, 5)
            .then(data =>
                res.json(data.results)
            ).catch(err =>
                res.send(err)
            )
    }
}

exports.getLastMessagesInChat = async (req, res) => {
    const chats = await User.relatedQuery('chats')
        .for(req.user.userId)

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
    
    res.json(result)
}

exports.addParticipants = async (req, res) => {
    //TODO
    if (!req.params.chatId || !req.body.data) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
    }

    const usersIds = req.body.data

    const chat = await Chat.query()
        .where('id', req.params.chatId)

    for (let userId of usersIds) {
        req.io.to('u' + userId).emit('join', userId)
        await Chat.relatedQuery('users')
            .for(chat)
            .relate(userId);
    }

    res.send()
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