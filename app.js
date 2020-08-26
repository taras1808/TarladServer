const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const apiRouter = require('./src/routes/ApiRoute')
const db = require('./src/models/Knex')

const app = express()
var http = require('http').createServer(app)
var io = require('./src/SocketIO')(http)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use('/api', apiRouter)

http.listen(3000, function() {
  	console.log('Example app listening on port 3000!')
});