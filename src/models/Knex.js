const config = require('../config/DbConfig')
const knex = require('knex')(config)
const { Model } = require('objection')
Model.knex(knex)
module.exports = knex
