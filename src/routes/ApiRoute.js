const router = require('express').Router();
const accountsRoute = require('./AccountsRoute')

router.use('/accounts', accountsRoute)

module.exports = router