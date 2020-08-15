const router = require('express').Router()
const messagesController = require('../controllers/MessagesController')
const jwtMiddleware = require('../middlewares/JwtMiddleware')

router.use('/:messageId/', jwtMiddleware)
router.delete('/:messageId/', messagesController.deleteMessage)

module.exports = router