// Imports
require('dotenv').config()
const mover = require('./app/mover')
const { log } = require('./app/logging')

log('Running mover strategy with initial config:', mover.config)

try {
  mover.run()
} catch (e) {
  log(e)
}
