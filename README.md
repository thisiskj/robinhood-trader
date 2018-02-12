## Setup

Setup a `.env` file
```

# Required
ROBINHOOD_USERNAME=you@example.com
ROBINHOOD_PASSWORD=password

# Parameters for the mover.js strategy
TESTING=true
SELL_AT_GAIN_PERCENT=1.0
SELL_AT_LOSS_PERCENT=-1.5
INVESTMENT_AMOUNT_USD=1000

# Optional for pushover notifications
PUSHOVER_USER=xxx
PUSHOVER_TOKEN=yyy
```

Once the .env file is configured, proceed...
```
npm install
node index.js
```

Alternatively just supply the environment variables on the command line:
```
ROBINHOOD_USERNAME=xxx@aaa.com ROBINHOOD_PASSWORD=yourpassword SELL_AT_GAIN_PERCENT=1.0 node index.js
```
## Docker Setup

Build Docker Container
```
docker build . -t robinhoodtrader
```

Run Docker Container
```
docker run --env-file [path_to_local_env_file] robinhoodtrader node index.js
```

## Strategies
**Warning: This is a Work In Progress, use at your own risk**
1. mover.js - Play the early morning jump on the best performing stock on the S&P500 from yesterday.
2. earnings.js - Play the excitement on the best estimate vs. actual eps on a stocks earnings release today.
