const router = require('express').Router()
const accountsController = require('../controllers/AccountsController')

router.post('/register', accountsController.register)
router.get('/check-email', accountsController.checkEmail)
router.get('/check-nickname', accountsController.checkNickname)
router.post('/authorize', accountsController.authorize)
router.post('/authenticate', accountsController.authenticate)
router.post('/logout', accountsController.logout)

module.exports = router
