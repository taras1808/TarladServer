const User = require('../models/User')
const Chat = require('../models/Chat')

exports.search = async (req, res) => {

	//TODO
	
    const nickname = req.query.q
	const userId = req.query.userId
	const page = req.query.page || 0

    User.query()
        .select('id', 'nickname', 'name', 'surname', 'image_url')
        .where('nickname', 'like', nickname + '%')
		.where('id', '!=', userId)
		.page(page, 10)
		.then(data => {
			res.send(data.results)
		})
		.catch(err => {
			res.status(500).send({
				message: err.message || 'Some error occurred while creating the User.'
			})
		})
}


exports.searchUsersForChat = async (req, res) => {

	//TODO
	
    const nickname = req.query.q
	const chatId = req.params.chatId
	const page = req.query.page || 0

	const chat = await Chat.query()
		.where('id', chatId)

    User.query()
        .select('id', 'nickname', 'name', 'surname', 'image_url')
		.where('nickname', 'like', nickname + '%')
		.whereNotIn('id',
			Chat.relatedQuery('users')
				.for(chat)
				.select('user_id')
		)
		.page(page, 10)
		.then(data => {
			res.send(data.results)
		})
		.catch(err => {
			res.status(500).send({
				message: err.message || 'Some error occurred while creating the User.'
			})
		})
}