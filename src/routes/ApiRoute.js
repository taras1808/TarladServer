const router = require('express').Router();
const accountsRoute = require('./AccountsRoute')
const searchRoute = require('./SearchRoute')
const chatsRoute = require('./ChatsRoute')

router.use('/accounts', accountsRoute)

router.use('/search', searchRoute)

router.use('/chats', chatsRoute)

module.exports = router