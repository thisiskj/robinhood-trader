//
// Script to manually get the S&P 500 current gainers
//

require('dotenv').config()
const request = require('request-promise-native');
const cheerio = require('cheerio');
const { log, pushLog } = require('./logging')
const RobinHood = require('robinhood-api');
const robinhood = new RobinHood();
const _ = require('lodash');
const storage = require('./storage');
require('console.table');

(async () => {
  // let h = await robinhood.getTickerHistoricals({
  //   symbol: 'EA',
  // })
  //
  // console.dir(h)

  // Download webpage
  const html = await request('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')

  // Parse
  const $ = cheerio.load(html);

  // Get S&P 500 Symbols from the table
  const symbols = $(".wikitable").first().find('td:first-child').map((i, td) => $(td).text()).get()
  // console.log(symbols)

  // Get top gainers
  let quotes = await robinhood.getQuotes({ symbols: symbols.join(',') })
  quotes = _.chain(quotes.results)
    .map((q) => {
      q.todays_gain = (q.last_trade_price - q.previous_close) / q.previous_close
      return q
    })
    .orderBy(['todays_gain'], ['desc'])
    .take(20)
    .value()

  console.table(quotes.map((q) => {
    return {
      Symbol: q.symbol,
      Last: '$' + q.last_trade_price,
      Gain: round(q.todays_gain*100, 2) + '%'
    }
  }))

  // Get fundamentals
  // _.chunk(symbols, 100).forEach(async (chunk) => {
  //   const fundamentals = await robinhood.getFundamentals({ symbols: chunk.join(',') })
  //   console.log(fundamentals)
  // })

  // Get instruments
  // let instruments = await getInstruments()

})()

function getInstruments() {

  return new Promise(async function(resolve, reject) {
    log("Getting instruments")
    let cached = storage.get('instruments')

    if (cached) {
      return resolve(cached)
    }

    log("Instruments not found in cache, fetching...")

    // Get instruments
    let instruments = []

    // First page
    let i = await robinhood.getInstruments()
    instruments = instruments.concat(i.results)

    // Get the remaining pages
    do {
      let cursor = i.next.match(/cursor=(.*)/)
      i = await robinhood.getInstruments({ cursor: cursor[1] })
      instruments = instruments.concat(i.results)

      log(`Fetched ${instruments.length} instruments...`)
    } while (i.next !== null)

    log(`Saving ${instruments.length} instruments.`)
    storage.set('instruments', instruments)

    return resolve(instruments)
  });
}

function round(number, precision) {
    precision = (typeof precision === 'undefined') ? 2 : precision
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
}
