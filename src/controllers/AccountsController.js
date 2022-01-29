const User = require('../models/User')
const Token = require('../models/Token')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
	}
	const user = {
		email: req.body.email,
		password: req.body.password,
		nickname: req.body.nickname,
		name: req.body.name,
		surname: req.body.surname,
		imageUrl: req.body.imagerl
	}
	const exists = await User.query()
		.where(builder =>
			builder.where('email', user.email)
				.orWhere('nickname', user.nickname)
		)
	if (exists && exists.length > 0) {
		res.status(409).send({
			message: 'User already exists.'
		})
		return
	}
	const newUser = await User.query().insert(user)
	const jwtToken = jwt.sign({ user: { userId: newUser.id } }, 'yt6r5478rt87god938gf9h34f3', { expiresIn: '1H' })
	const token = crypto.randomBytes(32).toString('hex');
	Token.query().insert({
		value: token,
		user_id: newUser.id,
		time: new Date().getTime()
	}).then(data => {
		res.send({
			token: jwtToken,
			refreshToken: {
				value: data.value,
				userId: data.user_id,
			}
		})
	}).catch(err =>
		res.status(500).send({
			message: err || 'Some error occurred while creating the User.'
		})
	)
}

exports.checkEmail = async (req, res) => {
	if (!req.query.email) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
	}
	const email = req.query.email
	const exists = await User.query()
		.select(1)
		.where('email', email)
	if (exists && exists.length > 0) {
		res.status(409).send({
			message: 'User already exists'
		})
		return
	}
	res.send()
}

exports.checkNickname = async (req, res) => {
	if (!req.query.nickname) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
	}
	const nickname = req.query.nickname
	const exists = await User.query()
		.select(1)
		.where('nickname', nickname)
	if (exists && exists.length > 0) {
		res.status(409).send({
			message: 'User already exists.'
		})
		return
	}
	res.send()
}

exports.authorize = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
	}
	const creditentials = {
		email: req.body.email,
		password: req.body.password
	}
	const exists = await User.query()
		.select('id')
		.where('email', creditentials.email)
		.where('password', creditentials.password)
	if (!exists || exists.length === 0) {
		res.status(403).send({
			message: 'Forbidden'
		})
		return
	}
	const jwtToken = jwt.sign({ user: { userId: exists[0].id } }, 'yt6r5478rt87god938gf9h34f3', { expiresIn: '1H' })
	const token = crypto.randomBytes(32).toString('hex');
	Token.query().insert({
		value: token,
		user_id: exists[0].id,
		time: new Date().getTime()
	}).then(data => {
		res.send({
			token: jwtToken,
			refreshToken: {
				value: data.value,
				userId: data.user_id,
			}
		})
	}).catch(err =>
		res.status(500).send({
			message: err || 'Some error occurred while creating the Token.'
		})
	)
}

exports.authenticate = async (req, res) => {
	if (!req.body.refreshToken) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
	}
	const refreshToken = req.body.refreshToken
	const exists = await Token.query()
		.select('user_id')
		.where('value', refreshToken)
	if (!exists || exists.length === 0) {
		res.status(403).send({
			message: 'Forbidden'
		})
		return
	}
	const jwtToken = jwt.sign({ user: { userId: exists[0].user_id } }, 'yt6r5478rt87god938gf9h34f3', { expiresIn: '1H' })
	const token = crypto.randomBytes(32).toString('hex');
	Token.query()
		.where('value', refreshToken)
		.patch({ value: token, time: new Date().getTime() })
		.then(
			res.send({
				token: jwtToken,
				refreshToken: {
					value: token,
					userId: exists[0].user_id,
				}
			})
		).catch(err =>
			res.status(500).send({
				message: err || 'Some error occurred while updating the Token.'
			})
		)
}

exports.logout = async (req, res) => {
	if (!req.body.refreshToken) {
		res.status(400).send({
			message: 'Content can not be empty!'
		})
		return
	}
	const refreshToken = req.body.refreshToken
	const exists = await Token.query()
		.select('user_id')
		.where('value', refreshToken)
	if (!exists || exists.length === 0) {
		res.status(403).send({
			message: 'Forbidden'
		})
		return
	}
	Token.query()
		.where('value', refreshToken)
		.delete()
		.then(
			res.send()
		).catch(err =>
			res.status(500).send({
				message: err || 'Some error occurred while deleting the Token.'
			})
		)
}
