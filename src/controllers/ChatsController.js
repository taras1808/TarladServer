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
        req.io.to('u' + userId).emit('join', userId)
        await Chat.relatedQuery('users')
            .for(chat)
            .relate(userId);
    }

    res.json({ ...chat, users })
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