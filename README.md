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

## Process

**Warning: This is a Work In Progress, use at your own risk**

### Step 1: Place Order
You should run at 9:29am EST

1. Find worst performing stock
1. Get account balance
1. Buy it
1. Wait for buy order to complete
1. Place sell order

### Step 2: Checkup

Checkup will run until 9:59am

1. If sell order has not executed by 9:59am, cancel it
1. Submit a market order
