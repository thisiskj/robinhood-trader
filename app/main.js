const express = require('express')
const app = express()
const cors = require('cors');
const WebSocket = require('ws')
const wss = new WebSocket.Server({port: 40510})
const mover = require('./mover');
const screeners = require('./screeners');

app.use(cors())

// respond with "hello world" when a GET request is made to the homepage
app.get('/test', function (req, res) {
  res.send({
    hello: 'world2'
  })
})

// Screeners
app.get('/sp500/gainers/live', async (req, res) => {
  res.send(await screeners.SP500.live('desc'))
})
app.get('/sp500/losers/live', async (req, res) => {
  res.send(await screeners.SP500.live('asc'))
})
app.get('/sp500/gainers/robinhood', async (req, res) => {
  res.send(await screeners.SP500.robinhood('up'))
})
app.get('/sp500/losers/robinhood', async (req, res) => {
  res.send(await screeners.SP500.robinhood('down'))
})

app.get('/strategy/mover/config', (req, res) => {
  res.send(mover.config)
})
app.get('/strategy/mover/config/:key/:value', (req, res) => {
  mover.config[req.params.key] = req.params.value
})

app.get('/run', (req, res) => {
  // We can essentially fork a background process by doing a settimeout here
  setTimeout(() => {
    // perform run()
    console.log('run()ing')
    // run()
  }, 1000)

  // Send back an okay we're running
  setTimeout(() => {
    res.send({ success: true })
  }, 2000)
})

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
