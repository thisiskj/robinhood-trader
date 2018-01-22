const PushoverNotifications = require( 'pushover-notifications' )
const moment = require('moment');

// Connect to pushover
const pushover = new PushoverNotifications({
  user: 'uUWBxnaR8975vVVSx7fCFbMjd6RFEe',
  token: 'abivuw6oqy2nespv6bwtt17bzim1oj',
})

// Stdout logger
function log() {
  console.log(moment().format("MMM D h:mm:ss A"), ...arguments)
}

// Pushover + stdout logger
function pushLog() {
  // Send to pushover
  pushover.send({
    message: Object.values(arguments).join(' '),
    title: "Robinhood Trader",
  }, function( err, result ) {
    if (err) { log(err) }
  })

  // stdout log
  log(...arguments)
}

module.exports = {
  log,
  pushLog
}
