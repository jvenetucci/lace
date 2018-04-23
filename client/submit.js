const {createContext, CryptoFactory} = require('sawtooth-sdk/signing');
const {createHash} = require ('crypto');
const {protobuf} = require('sawtooth-sdk');
const cbor = require('cbor');
const request = require('request');

// Some constants that define the pizzaTP transaction processor
const FAMILY_NAME = 'pizzaTP'
const FAMILY_VERSION = '0.1'
const NAMESPACE_PREFIX = 'b988b1'

// Generate a private key for use in signing transactions & batches
const context = createContext('secp256k1');
const privateKey = context.newRandomPrivateKey();
const signer = new CryptoFactory(context).newSigner(privateKey);

// Grab the arguments passed in from the command line
const action = process.argv[2];
const args = process.argv.slice(3);

// For input validation purposes
const VALIDTYPES = [
    'pepperoni',
    'cheese',
    'veggie'
]

const VALIDSTATUS = [
    'prep',
    'oven',
    'ready',
]

if (action == "create") {
    console.log("Attempting to create a new order with number: " + args[0] + "\n");
    
    // Validate args
    validateArgs(action, args);

    // Create a payload object that consists of:
    //      1. Action  ---> In this case its the 'create' action
    //      2. Order ID
    //      3. Customer Name
    //      4. Type of Pizza
    //      5. The current time (In milliseconds since Jan 1, 1970 00:00:00 UTC)
    const payload = { 
        action: 'create',
        orderID: parseInt(args[0], 10),     // Change the orderID from a string to a number in base 10
        custName: args[1],
        type: args[2],
        time: Date.now()
    }

    // Encode the payload in a binary format
    const payloadAsBytes = cbor.encode(payload);

    // Create a transaction header (unlike the payload, we must have specific items in this one; see sawtooth docs)
    const transactionHeader = {
        familyName: FAMILY_NAME,
        familyVersion: FAMILY_VERSION,
        inputs: [NAMESPACE_PREFIX],     // Where in state that this transaction is allowed to read from
        outputs: [NAMESPACE_PREFIX],    // Where in state that this transaction is allowed to write to
        signerPublicKey: signer.getPublicKey().asHex(),
        batcherPublicKey: signer.getPublicKey().asHex(),
        dependencies: [],   // This transaction requires no others to be commited before it, thus no dependencies
        payloadSha512: createHash('sha512').update(payloadAsBytes).digest('hex')
    }
    // How exactly is payloadSha512 computed?
    //  1. createHash('sha512') creates a hash object using the sha512 algorithm
    //  2. update(payloadAsBytes) updates the hash object with the byte representation of the payload
    //  3. digest('hex') creates the digest of the hash encoded as hex
    // The result is a reference to the payload

    // Encode the transaction header
    // NOTE: Unlike the payload, we don't get to choose the encoding scheme since the transaction header
    //  is composed of a specific number of items.
    // Sawtooth provides a protocol buffer definition that we can use.
    const transactionHeaderAsBytes = protobuf.TransactionHeader.encode(transactionHeader).finish();

    // Create a signature of who is publishing this transaction.
    // Uses the users private key to sign through the Signer object
    const signature = signer.sign(transactionHeaderAsBytes);

    // Create the transaction. A transaction consists of:
    //      1. Transaction Header (Metadata about the transaction)
    //      2. Header Signature (Who is publishing this transaction)
    //      3. Payload (The data of the transaction)
    const transaction = protobuf.Transaction.create({
        header: transactionHeaderAsBytes,
        headerSignature: signature,
        payload: payloadAsBytes
    })

    // Now we have a single transaction, but to submit it to the validator it must be wrapped in a batch
    // A batch consists of:
    //      1. Batch Header (Metadata about the batch)
    //      2. Header Signature (Who is publishing this batch)
    //      3. A list of transactions included in the batch (Batches are atomic; either all transactions published, or none)
    
    // Create a list of transactions to be wrapped in the batch
    // In this case we only have the one
    const transactionList = [transaction];

    // Create the batch header
    const batchHeader = {
        signerPublicKey: signer.getPublicKey().asHex(),
        transactionIds: transactionList.map((txn) => txn.headerSignature) // Create a list of transactions, reffered to by their header signature
    }

    // Encode the batch header
    const batchHeaderAsBytes = protobuf.BatchHeader.encode(batchHeader).finish();

    // Create a signature of who is publishing this batch
    const batchSignature = signer.sign(batchHeaderAsBytes);

    // Create the batch, combing all the individual components together
    const batch = protobuf.Batch.create({
        header: batchHeaderAsBytes,
        headerSignature: batchSignature,
        transactions: transactionList
    })

    // You thought you were finished, but nah
    // Now you need to put the batch in a batch list
    // A BatchList contains a list of batches and is **not** atomic, unlike a single batch
    // We only have a single batch
    const batchList = {
        batches: [batch]
    }

    // Encode the batch list
    const batchListAsBytes = protobuf.BatchList.encode(batchList).finish();

    // Now we are ready to submit a request to the validator.
    // Using the request library to make a simple HTTP post request to REST API
    request.post({
        url: 'http://localhost:8008/batches',
        body: batchListAsBytes,
        headers: {'Content-Type': 'application/octet-stream'}
    },  (err, response, responseBody) => {
            if (err) {
                return console.log("Problem submitting to the validator...\n" + err)
            }

            // The sawtooth API Docs say that a status code of 202 indicates a batch was successfully sent to the validator
            //  but does not say if the transactions in the batch were successful or not.
            //  Need to check the /batch_status endpoint for more info
            if (response.statusCode == 202) {
                getBatchStatus(JSON.parse(responseBody).link)
            } else {
                console.log("Received status code: %d", response.statusCode)
                return console.log(JSON.parse(responseBody).error.message)
            }
    })
} else if (action == "update") {
    // Some simple input validation
    if (args.length != 2) {
        console.error("Invalid args...")
        process.exit(9)
    }
    if (!(VALIDSTATUS.includes(args[1]))) {
        console.error(args[1] + " is not a valid status")
        process.exit(9)
    }
    console.log("Attempting to update order number %i\n", args[0]);

    // *** Create a Transaction ***
    const payload = { 
        action: 'update',
        orderID: parseInt(args[0], 10),
        newStatus: args[1]
    }

    payloadAsBytes = cbor.encode(payload)

    const transactionHeader = {
        familyName: FAMILY_NAME,
        familyVersion: FAMILY_VERSION,
        inputs: [NAMESPACE_PREFIX], 
        outputs: [NAMESPACE_PREFIX],
        signerPublicKey: signer.getPublicKey().asHex(),
        batcherPublicKey: signer.getPublicKey().asHex(),
        dependencies: [],
        payloadSha512: createHash('sha512').update(payloadAsBytes).digest('hex')
    }

    const transactionHeaderAsBytes = protobuf.TransactionHeader.encode(transactionHeader).finish();

    const signature = signer.sign(transactionHeaderAsBytes);

    const transaction = protobuf.Transaction.create({
        header: transactionHeaderAsBytes,
        headerSignature: signature,
        payload: payloadAsBytes
    })
    // *** Finished Transaction ***

    // *** Create a Batch ***
    const transactionList = [transaction];

    const batchHeader = {
        signerPublicKey: signer.getPublicKey().asHex(),
        transactionIds: transactionList.map((txn) => txn.headerSignature)
    }

    const batchHeaderAsBytes = protobuf.BatchHeader.encode(batchHeader).finish();

    const batchSignature = signer.sign(batchHeaderAsBytes);

    const batch = protobuf.Batch.create({
        header: batchHeaderAsBytes,
        headerSignature: batchSignature,
        transactions: transactionList
    })
    // *** Finished Batch ***

    // *** Create a Batch List ***
    const batchList = {
        batches: [batch]
    }

    const batchListAsBytes = protobuf.BatchList.encode(batchList).finish();
    // *** Finished Batch List ***

    // *** Send Batch List to Validator ***
    request.post({
        url: 'http://localhost:8008/batches',
        body: batchListAsBytes,
        headers: {'Content-Type': 'application/octet-stream'}
    },  (err, response, responseBody) => {
        if (err) {
            return console.log("Problem submitting to the validator...\n" + err)
        }
        if (response.statusCode == 202) {
            getBatchStatus(JSON.parse(responseBody).link)
        } else {
            console.log("Received status code: %d", response.statusCode)
            return console.log(JSON.parse(responseBody).error.message)
        }
    })

} else if (action == "get") {
    console.log("Getting info for order %i\n", args[0])

    request.get({
        url: 'http://localhost:8008/state/' + generateAddress(args[0]),
    },  (err, response, responseBody) => {
            if (err) {
                return console.log("Problem submitting to the validator...\n" + err)
            }

            if(response.statusCode == 200) {
            // Ok so now this was interesting, when you query the state using the /state endpoint of the REST API
            //  it returns the data encoded in base64, which you will need to decode,
            //  and then decode again using cbor (what the transaction processor used)
            // We can use the global buffer object to decode the data
            // Then follow up with cbor 
            data = Buffer.from(JSON.parse(responseBody).data, 'base64')
            data = cbor.decode(data)
            return console.log("Order ID: %i\nCustomer: %s\nType: %s\nStatus: %s", data.orderNum, data.custName, data.type, data.status)
            } else {
                console.log("Received status code: %d", response.statusCode)
                return console.log(JSON.parse(responseBody).error.message)
            }
            
    })
} else {
    console.error("Valid actions are either 'create', 'update', or 'get'");
    process.exit(9); // 9 because that is what node.js uses for Invalid Args
}

// An example of validating command line args for the CREATE method
function validateArgs(action, argArray) {
    switch (action) {
        case 'create':
            if (args.length != 3) {
                console.error("ERROR: Incorrect number of args for create");
                process.exit(9);
            }
            if (isNaN(args[0])) {   //The orderID is stored as a string in JS, so we can't use Number.isInteger()
                console.error("ERROR: orderID must be a number: " + args[0]);
                process.exit(9);
            }
            if (!(VALIDTYPES.includes(args[2]))) {
                console.error("ERROR: Valid pizza types are 'pepperoni', 'cheese', or 'veggie': " + args[2]);
                process.exit(9);
            }  
            break;
    
        default:
            console.error("Validate Arg function recieved unknown action: " + action);
            break;
    }
}

// Generates a 70 character address using the namespace prefix and a hash of the order ID
// Note that this should generate the exact same address that the python code generates
function generateAddress(orderID) {
    hashed = createHash('sha512').update(orderID, 'utf8').digest('hex').slice(-64)
    return NAMESPACE_PREFIX + hashed
}

// Gets the current status of batch from the rest APIs /batch_statuses endpoint and prints it to console
// Will wait until the  batch has committed before reporting back
function getBatchStatus(url) {
    request.get({
        url: url + '&wait=true'   // We want to wait for the batches to finished before we query the status
    }, (err, response, responseBody) => {
        if (err) {
            return console.log("Problem querying the validator...\n" + err)
        }

        // Need to parse the the response from the GET request
        // Mainly need the status of the batch, and any error messages from the validator
        const msg = JSON.parse(responseBody)
        const batchStatus = msg.data[0].status

        if (batchStatus == 'INVALID') {
            return console.log("ERROR: " + msg.data[0].invalid_transactions[0].message)
        } else if (batchStatus == 'PENDING') {
            // This should never happen since we passed the '&wait=true' in the GET request, but just in case...
            // Possible that this could get stuck in an endless loop if validator is continiously disconnecting/reconnecting, etc
            console.debug("Current Status is 'Pending'. Trying to query batch status again...")
            getBatchStatus(url)
        } else if (batchStatus == 'COMMITTED'){
            // Otherwise the transaction processed successfully
            return console.log("Success!")
        }
    })
}