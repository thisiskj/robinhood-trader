## Setup

Setup a `.env` file
```
ROBINHOOD_USERNAME=you@example.com
ROBINHOOD_PASSWORD=password

# Optional for pushover notifications
PUSHOVER_USER=xxx
PUSHOVER_TOKEN=yyy
```

Once the .env file is configured, proceed...
```
npm install
node mover.js
```

If the above does not work try:
```
ROBINHOOD_USERNAME=xxx@aaa.com ROBINHOOD_PASSWORD=yourpassword DESIRED_RETURN=1.0 node mover.js
```
## Alternative Docker Setup

Build Docker Container
```
docker build . -t testrobinhood
```

Run Docker Container
```
docker run -e ROBINHOOD_USERNAME=you@example.com -e ROBINHOOD_PASSWORD=password -e DESIRED_RETURN=1.0 mover.js
```

## Strategies
1. mover.js - Play the early morning jump on the best performing stock on the S&P500 from yesterday.
2. earnings.js - Play the excitement on the best estimate vs. actual eps on a stocks earnings release today.

## Process

**Warning: This is a Work In Progress, use at your own risk**

### Test - Same functions as order.js, but doesn't actually place an order (for the faint of heart)
You should run at 9:31am EST

1. Find best performing stock
1. Get account balance
1. Buy it
1. Wait for buy order to complete
1. Place sell order at 1% gain
1. Watch the price and if we see a -1.5% loss, sumbit a market sell order



### Place Order (not for the faint of heart)
You should run at 9:31am EST

1. Find best performing stock
1. Get account balance
1. Buy it
1. Wait for buy order to complete
1. Place sell order at 1% gain
1. Watch the price and if we see a -1.5% loss, sumbit a market sell order


### Todo:
From: https://www.npmjs.com/package/robinhood-api
`robinhood.getCompaniesReportingEarningsWithin(opts)`
`robinhood.getFundamentals(opts)`
