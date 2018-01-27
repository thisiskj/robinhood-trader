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
node order.js
```
## Alternative Docker Setup

Build Docker Container
```
docker build . -t testrobinhood 
```

Run Docker Container
```
docker run -e ROBINHOOD_USERNAME=you@example.com -e ROBINHOOD_PASSWORD=password testrobinhood
```

## Process

**Warning: This is a Work In Progress, use at your own risk**

### Step 1: Place Order
You should run at 9:31am EST

1. Find best performing stock
1. Get account balance
1. Buy it
1. Wait for buy order to complete
1. Place sell order at 1% gain
1. Watch the price and if we see a -1.5% loss, sumbit a market sell order
