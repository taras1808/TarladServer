const router = require('express').Router()
const chatsController = require('../controllers/ChatsController')
const jwtMiddleware = require('../middlewares/JwtMiddleware')

router.use('/create', jwtMiddleware)
router.post('/create', chatsController.create)

router.use('/:chatId/users', jwtMiddleware)
router.post('/:chatId/users', chatsController.addParticipants)

module.exports = router