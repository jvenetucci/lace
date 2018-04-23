# lace
This repository contains code that demonstrates the usage of the sawtooth platform. As an example, a distributed ledger application for creating and updating pizza order transactions has been made. The code here demonstrates how to develop a transaction processor that can create and update entries in the [state data structure](https://sawtooth.hyperledger.org/docs/core/nightly/master/architecture/global_state.html). The code for all of this is located in `/processor`.

This example also contains a CLI for interacting with the transaction processor. It can create and update existing pizza orders, and can query the status of orders. This CLI is written in javascript and run using the node.js runtime. The code for this is located in `/client`.

The code for the processor should demonstrate how to:
- Unpack transactions from a client
- Retrieve the global state, or parts of it
- Create new state objects
- Update existing objects
- Write & update the state

The code for the client should demonstrate how to:
- Create a transaction and batch
- Submit batches to the validator
- Check on the status of batches and transactions
- View information about the current state

## How to run
Set up requires 3 separate terminal windows: (1) to run the docker images, (2) to run the pizza transaction process, and (3) to use the CLI.
1. Be in the root directory where `sawtooth-default.yaml` 
2. Run `docker-compose -f sawtooth-default.yaml up`. This window will be running the validator and other docker images.
3. New terminal window
4. Navigate to `/processor`
5. Run `source env/bin/activate`
6. Run `python3 main.py`. This window will be running the transaction processor.
7. New terminal window
8. Navigate to /client
8. Run node submit.js [action] [args] to submit requests

## How to use the CLI
The CLI can do 3 things:
1. Create a new pizza order `node submit.js create orderNum customerName pizzaType`
2. Update the status of an existing order `node submit.js update orderNum newStatus`
3. Get information about an existing order `node submit.js get orderNum`

### Create an order
Use the command `node submit.js create orderNum customerName pizzaType` to create a new order.
- If the order number is already being used, you will recieve an error
- Valid pizza types are either 'pepperoni', 'cheese', or 'veggie'

### Update an order
Every new pizza order starts off with the status of 'new'. Using `node submit.js update orderNum newStatus` you can update the status of a pizza. A pizza order goes through a very specific status lifecycle.

    new -> prep -> oven -> ready
This means that accept status changes must follow this exact order. For example, a pizza that has the status of 'new' cannot automatically be changed to 'ready' without going through the 'prep' and 'oven' stages. If you attempt to skip any of the stages you will get an error and the status will remain unchanged. Also you cannot go back in status, for example once a pizza is in the oven you cannot revert it back to 'new'.

#### Example
I've just created a new pizza and now I want to change its status to prep:

    $ node submit.js create 123 example cheese
        Attempting to create a new order with number: 123

        Success!
    $ node submit.js 123 prep
        Attempting to update order number 123

        Success! 
    $
You should also verify with relevant `get` requests that the status does indeed change.   

### Get order information
Information about an order can be viewed using `node submit.js get orderNum`. If an order with the order number supplied exists then relevant information will be shown. Otherwise you will get an error stating that it doesn't exist.
