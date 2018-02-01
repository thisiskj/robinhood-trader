//
// Script to log the S&P 500 top movers (gainers and losers)
// It will log the results to the storage directory
//

// Imports
require('dotenv').config()
const moment = require('moment');
const { log, pushLog } = require('./logging')
const RobinHood = require('robinhood-api');
const robinhood = new RobinHood();
const fs = require('fs');
require('console.table');

// Get S&P 500 Losers
(async () => {
  // create `storage` directory if it does not exist
  const dir = `${__dirname}/storage`;
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  let savemeDown = []
  let savemeUp = []

  log('Getting Top 10 S&P 500 losers...')
  const sp500down = await robinhood.getSP500Movers({ direction: 'down' })

  for (res of sp500down.results) {
    const quote = await robinhood.getQuote({ symbol: res.symbol })
    savemeDown.push({
      symbol: res.symbol,
      last_pct: res.price_movement.market_hours_last_movement_pct,
      last_price: res.price_movement.market_hours_last_price,
      quote: quote
    })
  }
  console.table(savemeDown)

  const formattedDown = JSON.stringify(savemeDown, null, 4);
  const downFileName = `sp_500_down-${moment().format("YYYY-MM-DD-h:mm:ss-a")}`;
  fs.writeFile(`${__dirname}/storage/${downFileName}.json`, formattedDown);

  log('Getting Top 10 S&P 500 winners...')
  const sp500Up = await robinhood.getSP500Movers({ direction: 'up' })

  for (res of sp500Up.results) {
    const quote = await robinhood.getQuote({ symbol: res.symbol })
    savemeUp.push({
      symbol: res.symbol,
      last_pct: res.price_movement.market_hours_last_movement_pct,
      last_price: res.price_movement.market_hours_last_price,
      quote: quote
    })
  }
  console.table(savemeUp)

  const formattedUp = JSON.stringify(savemeUp, null, 4);
  const upFileName = `sp_500_up-${moment().format("YYYY-MM-DD-h:mm:ss-a")}`;
  fs.writeFile(`${__dirname}/storage/${upFileName}.json`, formattedUp);
})();
