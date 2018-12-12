'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  VUE_APP_BACKEND_URL: '"https://wat2-group-bill-splitter.herokuapp.com/"'
})
