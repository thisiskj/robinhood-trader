## Setup

Setup a `.env` file
```
ROBINHOOD_USERNAME=you@example.com
ROBINHOOD_PASSWORD=password
```

Once the .env file is configured, proceed...
```
npm install
node order.js

...[30 mins later]

node checkup.js
```

## Process
### Step 1: Place Order (order.js)

**Warning: This is a Work In Progress, use at your own risk**

Will run at 9:25am

1. Find worst performing stock
1. Get account balance
1. Buy it
1. Wait for buy order to complete
1. Place sell order

### Step 2: Checkup (checkup.js)

Checkup will run at 9:59am

1. If sell order has not executed, cancel it
1. Submit a market order??
