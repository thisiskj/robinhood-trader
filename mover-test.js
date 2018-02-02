// Imports
require('dotenv').config()
const { log, pushLog } = require('./logging')
const RobinHood = require('robinhood-api');
const robinhood = new RobinHood();
const moment = require('moment-timezone');

let desiredReturnAmount = 1.0

// Validate username/password exists
if (!process.env.ROBINHOOD_USERNAME || !process.env.ROBINHOOD_PASSWORD) {
  pushLog("Robinhood username or password missing")
  process.exit(1)
}

(async () => {
  try {
    log('Logging in as', process.env.ROBINHOOD_USERNAME, '...')
    let login = await robinhood.login({ username:process.env.ROBINHOOD_USERNAME, password:process.env.ROBINHOOD_PASSWORD})

    // Get user account balances
    log('Getting account balances...')
    let accounts = await robinhood.getAccounts()
    let account = accounts.results[0]
    log('Real Account Buying Power: ', account.buying_power)
    account.buying_power = 1000.00
    log('Fake Account Buying Power: ', account.buying_power)


    // Get S&P 500 Losers
    log('Getting Top 10 S&P 500 losers...')
    let sp500down = await robinhood.getSP500Movers({ direction: 'up' })
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
    let quantity = Math.floor(account.buying_power / security.last_trade_price)
    log("Attempting to buy", quantity, "shares of", worst.symbol, "at $", security.bid_price, "per share")

    pushLog(`Buy of ${security.symbol} has completed for ${security.last_trade_price}`)
    await sleep(1000)

    log("Now we wait for it to complete, good luck!")

    do {
      log('Sleeping for 10s...')
      await sleep(1000 * 10)

      let now = moment().tz("America/New_York").format('H:mm');

      // Get current quote
      let currentSecurity = await robinhood.getQuote({ symbol: security.symbol })
      let currentReturn = (currentSecurity.last_trade_price - security.last_trade_price) / security.last_trade_price * 100

      // take the gains
      if (currentReturn > desiredReturnAmount ){
        pushLog(`Congrats you'd have sold your position for a ${currentReturn}`)
        break
      }

      log(`Current price of ${security.symbol} is $${currentSecurity.last_trade_price} for a return of ${currentReturn}%`)

      // If its dropped 1.5%, then bail
      if (currentReturn < -1.50) {

        // Sleep
        log('Sleeping 10s...')
        await sleep(1000 * 10)

        pushLog(`Return is < -1.5%, market sell order placed`)

        break
      }
    } while (true)

    log('Goodbye!')

  } catch (e) {
    log(e)
  }
})();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function round(number, precision) {
    precision = (typeof precision === 'undefined') ? 2 : precision
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
}