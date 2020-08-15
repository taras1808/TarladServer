const router = require('express').Router()
const searchController = require('../controllers/SearchController')
const jwtMiddleware = require('../middlewares/JwtMiddleware')

router.get('/', searchController.search)

router.use('/chats/:chatId/users', jwtMiddleware)
router.get('/chats/:chatId/users', searchController.searchUsersForChat)

module.exports = router