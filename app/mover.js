//
// This is the main script that will attempt to make a profit
//

// Imports
require('dotenv').config()
const { log, pushLog } = require('./logging')
const RobinHood = require('robinhood-api');
const robinhood = new RobinHood();
const moment = require('moment-timezone');
const math = require('./math')

// Validate username/password exists
if (!process.env.ROBINHOOD_USERNAME || !process.env.ROBINHOOD_PASSWORD) {
  pushLog("Robinhood username or password missing")
  process.exit(1)
}

class Mover {

  constructor() {
    // Read environment variables and create the final configuration
    this.config = {
      sell_at_gain_percent: parseFloat(process.env.SELL_AT_GAIN_PERCENT),
      sell_at_loss_percent: parseFloat(process.env.SELL_AT_LOSS_PERCENT),
      investment_amount: parseFloat(process.env.INVESTMENT_AMOUNT_USD),
      testing: process.env.TESTING === 'true',
      production: process.env.TESTING !== 'true',
    }

    log('Running in mode:',  this.config.testing ? 'test' : 'production')
  }

  async run() {
    log('Logging in as', process.env.ROBINHOOD_USERNAME, '...')
    let login = await robinhood.login({ username:process.env.ROBINHOOD_USERNAME, password:process.env.ROBINHOOD_PASSWORD})

    // let userData = await robinhood.getUserData()
    // log('userData', userData)

    // Get user account balances
    log('Getting account balances...')
    let accounts = await robinhood.getAccounts()
    let account = accounts.results[0]

    // Get investment amount
    let investment = account.buying_power
    if (this.config.investment_amount) {
      investment = this.config.investment_amount
    }
    log(`Investment amount is $${investment}`)

    log('Sleeping 3s...')
    await this.sleep(3000)

    // Get S&P 500 winners
    log('Getting Top 10 S&P 500 winners...')
    let sp500 = await robinhood.getSP500Movers({ direction: 'up' })
    sp500.results.forEach((res) => { log(res.symbol, res.price_movement.market_hours_last_movement_pct + '%', '$' + res.price_movement.market_hours_last_price) })

    // Get the top
    let top = sp500.results[0]

    // Get the current quote data for the top loser
    let security = await robinhood.getQuote({ symbol: top.symbol })
    log('top security quote:', security)

    // See if we have enough money
    if (parseFloat(investment) < parseFloat(security.last_trade_price)) {
      pushLog("Not enough ($" + investment + ") to buy " + top.symbol + " at $" + security.last_trade_price)
      return
    }

    // Determine how much we want to buy
    let quantity = Math.floor(investment / security.last_trade_price)
    log("Attempting to buy", quantity, "shares of", top.symbol, "at $", security.last_trade_price, "per share")

    // Place order
    let buy = {
      account: account.url,
      instrument: security.instrument,
      symbol: security.symbol,
      type: 'limit',
      time_in_force: 'gtc',
      trigger: 'immediate',
      price: math.round(security.last_trade_price, 2),
      quantity: quantity,
      side: 'buy',
    }
    log("Submitting BUY:", buy)

    let averagePrice = security.last_trade_price
    if (this.config.production) {
      let buyOrder = await robinhood.placeOrder(buy)
      log('buyOrder:', buyOrder)

      // Wait for buy to complete
      let o
      do {
        log('Waiting for BUY to complete...')
        await this.sleep(1000)
        o = await robinhood.getOrder({ order_id: buyOrder.id })
        log('order:', o)
      } while (o.state != 'filled');
      averagePrice = o.average_price
      log('Buy order response:', o)
    } else {
      log('We are in test mode, faking a successful buy order')
    }

    pushLog(`Buy of ${security.symbol} has completed for ${averagePrice}`)
    await this.sleep(1000)

    // Place sell order at 1% gain
    let factor = (this.config.sell_at_gain_percent * .01) + 1
    let sell = {
      account: account.url,
      instrument: security.instrument,
      symbol: security.symbol,
      type: 'limit',
      time_in_force: 'gtc',
      trigger: 'immediate',
      price: math.round(averagePrice * factor, 2),
      quantity: quantity,
      side: 'sell',
    }
    log("Submitting SELL:", sell)

    let sellOrder
    if (this.config.production) {
      sellOrder = await robinhood.placeOrder(sell)
      log('sellOrder:', sellOrder)
    } else {
      log('In testing mode, submitting fake sell order')
    }

    log("Now we wait for it to complete, good luck!")

    do {
      log('Sleeping for 10s...')
      await this.sleep(1000 * 10)

      let now = moment().tz("America/New_York").format('H:mm');

      if (this.config.production) {
        let s = await robinhood.getOrder({ order_id: sellOrder.id })
        log(s)
        log('Sell order status is', s.state)

        if (s.state == 'filled') {
          pushLog(`Sell order for 1% gain has been filled, congrats!`)
          break
        }
      }

      // Get current quote
      let currentSecurity = await robinhood.getQuote({ symbol: security.symbol })
      let currentReturn = (currentSecurity.last_trade_price - averagePrice) / averagePrice * 100
      log(`Current price of ${security.symbol} is $${currentSecurity.last_trade_price} for a return of ${currentReturn}% (Purchased at $${averagePrice})`)

      // If its dropped, then bail
      if (currentReturn < this.config.sell_at_loss_percent) {

        if (this.config.production) {
          // Cancel sell order
          let cancel = await robinhood.cancelOrder({ order_id: sellOrder.id })
          log('Canceled order:', cancel)

          // Sleep
          log('Sleeping 10s...')
          await this.sleep(1000 * 10)

          // Place market sell order
          let marketSell = {
            account: account.url,
            instrument: security.instrument,
            symbol: security.symbol,
            type: 'market',
            time_in_force: 'gtc',
            trigger: 'immediate',
            quantity: quantity,
            side: 'sell',
          }
          log("Submitting market SELL:", marketSell)
          let marketSellOrder = await robinhood.placeOrder(marketSell)
          log('marketSellOrder:', marketSellOrder)
        }

        pushLog(`Return is < ${this.config.sell_at_loss_percent}%, market sell order placed`)

        break
      }
    } while (true)

    log('Goodbye!')
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}


module.exports = new Mover
