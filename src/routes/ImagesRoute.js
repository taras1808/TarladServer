const router = require('express').Router()
const imagesController = require('../controllers/ImagesController')

router.post('/upload', imagesController.save)

module.exports = router
