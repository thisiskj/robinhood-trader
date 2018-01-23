// Imports
require('dotenv').config()
const { log, pushLog } = require('./logging')
const RobinHood = require('./robinhood-api');
const robinhood = new RobinHood();

// Validate username/password exists
if (!process.env.ROBINHOOD_USERNAME || !process.env.ROBINHOOD_PASSWORD) {
  pushLog("Robinhood username or password missing")
  process.exit(1)
}

(async () => {
  try {
    log('Logging in as', process.env.ROBINHOOD_USERNAME, '...')
    let login = await robinhood.login({ username:process.env.ROBINHOOD_USERNAME, password:process.env.ROBINHOOD_PASSWORD})

    // let userData = await robinhood.getUserData()
    // log('userData', userData)

    // Get user account balances
    log('Getting account balances...')
    let accounts = await robinhood.getAccounts()
    let account = accounts.results[0]

    // Get S&P 500 Losers
    log('Getting Top 10 S&P 500 losers...')
    let sp500down = await robinhood.getSP500Movers({ direction: 'down' })
    sp500down.results.forEach((res) => { log(res.symbol, res.price_movement.market_hours_last_movement_pct + '%', '$' + res.price_movement.market_hours_last_price) })

    // Get the worst loser
    let worst = sp500down.results[0]

    // Get the current quote data for the worst loser
    let security = await robinhood.getQuote({ symbol: worst.symbol })

    // See if we have enough money
    if (parseFloat(account.buying_power) < parseFloat(security.bid_price)) {
      pushLog("Not enough funds ($" + account.buying_power + ") in account to buy " + worst.symbol + " at $" + security.bid_price)
      return
    }

    // Determine how much we want to buy
    let quantity = Math.floor(account.buying_power / security.bid_price)
    log("Attempting to buy", quantity, "shares of", worst.symbol, "at $", security.bid_price, "per share")

    // Place order
    let buy = {
      account: account.url,
      instrument: security.instrument,
      symbol: security.symbol,
      type: 'limit',
      time_in_force: 'gtc',
      trigger: 'immediate',
      price: security.bid_price,
      quantity: quantity,
      side: 'buy',
    }
    log("Submitting BUY:", buy)
    let buyOrder = await robinhood.placeOrder(buy)
    log('buyOrder:', buyOrder)

    // Wait for buy to complete
    let o
    do {
      log('Waiting for BUY to complete...')
      await sleep(1000)
      o = await robinhood.getOrder({ order_id: buyOrder.id })
      log('order:', o)
    } while (o.state == 'queued');

    // Place sell order at 1% gain
    let sell = {
      account: account.url,
      instrument: security.instrument,
      symbol: security.symbol,
      type: 'limit',
      time_in_force: 'gtc',
      trigger: 'immediate',
      price: security.bid_price * 1.01,
      quantity: quantity,
      side: 'sell',
    }
    log("Submitting SELL:", sell)
    let sellOrder = await robinhood.placeOrder(sell)
    log('sellOrder:', sellOrder)

    log("Script complete, good luck!")

    // Samples...

    // let orders = await robinhood.getRecentOrders()
    // log('orders:', orders)

    // let o = await robinhood.getOrder({ order_id: '0e435744-d254-4570-8f26-fe4855c3cc35' })
    // log('order:', o)

    // let cancel = await robinhood.cancelOrder({ order_id: '0e435744-d254-4570-8f26-fe4855c3cc35' })
    // log('canceled order:', cancel)

    // o = await robinhood.getOrder({ order_id: '0e435744-d254-4570-8f26-fe4855c3cc35' })
    // log('order:', o)

    // let order = await robinhood.placeOrder({
    //   account: account.url,
    //   instrument: assetARGS.instrument,
    //   symbol: 'ARGS',
    //   type: 'limit',
    //   time_in_force: 'gtc',
    //   trigger: 'immediate',
    //   price: 2.10,
    //   quantity: 1,
    //   side: 'buy',
    // })
    // log('order', order)
  } catch (e) {
    log(e)
  }
})();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
