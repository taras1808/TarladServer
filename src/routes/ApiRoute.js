const router = require('express').Router();
const accountsRoute = require('./AccountsRoute')
const imagesRoute = require('./ImagesRoute')

router.use('/accounts', accountsRoute)

router.use('/images', imagesRoute)

module.exports = router