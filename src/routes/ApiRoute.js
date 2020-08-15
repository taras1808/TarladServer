const router = require('express').Router();
const accountsRoute = require('./AccountsRoute')
const searchRoute = require('./SearchRoute')
const chatsRoute = require('./ChatsRoute')
const messagesRoute = require('./MessagesRoute')

router.use('/accounts', accountsRoute)

router.use('/search', searchRoute)

router.use('/chats', chatsRoute)

router.use('/messages', messagesRoute)

module.exports = router