const User = require('../models/User')
const Chat = require('../models/Chat')
const Message = require('../models/Message')

exports.deleteMessage = async (req, res) => {
    if (!req.params.messageId) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
    }

    var chat = await Message.query()
        .select('chat_id')
        .where('id', req.params.messageId)


    Message.query()
        .delete()
        .where('id', req.params.messageId)
        .then(_ => {
            req.io.to(chat[0].chat_id).emit('del', req.params.messageId)
            res.send();
        })
}