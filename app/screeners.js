//
// Script to log the S&P 500 top movers (gainers and losers)
// It will log the results to the storage directory
//

// Imports
require('dotenv').config()
const request = require('request-promise-native');
const cheerio = require('cheerio');
const { log, pushLog } = require('./logging')
const RobinHood = require('robinhood-api');
const robinhood = new RobinHood();
const _ = require('lodash');
const math = require('./math');

class SP500 {
  async robinhood(direction) {

    log('Getting Top 10 S&P 500 from Robinhoods API...')

    let save = []
    const sp500 = await robinhood.getSP500Movers({ direction: direction })

    for (let res of sp500.results) {
      const quote = await robinhood.getQuote({ symbol: res.symbol })
      save.push({
        symbol: res.symbol,
        last_pct: parseFloat(res.price_movement.market_hours_last_movement_pct),
        last_price: res.price_movement.market_hours_last_price,
      })
    }

    return save
  }

  async live(direction) {

    // Download webpage
    const html = await request('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')

    // Parse
    const $ = cheerio.load(html);

    // Get S&P 500 Symbols from the table
    const symbols = $(".wikitable").first().find('td:first-child').map((i, td) => $(td).text()).get()

    log("Getting top gainers from S&P 500 Live...")

    // Get top gainers
    let quotes = await robinhood.getQuotes({ symbols: symbols.join(',') })
    quotes = _.chain(quotes.results)
      .map((q) => {
        q.last_pct = math.round((q.last_trade_price - q.previous_close) / q.previous_close * 100)
        q.last_price = q.last_trade_price
        return q
      })
      .orderBy(['last_pct'], [direction])
      .take(10)
      .value()

    return quotes
  }

}

module.exports = {
  SP500: new SP500
}
