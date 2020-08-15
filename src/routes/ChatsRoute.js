const router = require('express').Router()
const chatsController = require('../controllers/ChatsController')
const jwtMiddleware = require('../middlewares/JwtMiddleware')

router.use('/create', jwtMiddleware)
router.post('/create', chatsController.create)

router.use('/', jwtMiddleware)
router.get('/', chatsController.getChats)

router.use('/:chatId/', jwtMiddleware)
router.get('/:chatId/', chatsController.getChat)

router.use('/:chatId/messages', jwtMiddleware)
router.get('/:chatId/messages', chatsController.getMessagesInChat)

router.use('/:chatId/users', jwtMiddleware)
router.post('/:chatId/users', chatsController.addParticipants)

router.use('/messages/last', jwtMiddleware)
router.get('/messages/last', chatsController.getLastMessagesInChat)

module.exports = router