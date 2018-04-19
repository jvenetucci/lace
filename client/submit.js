const {createContext, CryptoFactory} = require('sawtooth-sdk/signing');
const {createHash} = require ('crypto');
const {protobuf} = require('sawtooth-sdk');
const cbor = require('cbor');
const request = require('request');

// // Generate a private key for use in signing transactions & batches
const context = createContext('secp256k1');
const privateKey = context.newRandomPrivateKey();
const signer = new CryptoFactory(context).newSigner(privateKey);

// console.log(privateKey);
// console.log("It was created using " + privateKey.getAlgorithmName());

const action = process.argv[2];
// console.log(action);
// console.log(process.argv.length);
const args = process.argv.slice(3);
// console.log(args);

const VALIDTYPES = [
    'pepperoni',
    'cheese',
    'veggie'
]

if (action == "create") {
    console.log("CREATE");
    
    // Validate args
    validateArgs(action, args);

    // Create a payload object that consists of:
    //      1. Order ID
    //      2. Customer Name
    //      3. Type of Pizza
    //      4. The current time (In milliseconds since Jan 1, 1970 00:00:00 UTC)
    const payload = { 
        orderID: parseInt(args[0], 10),     // Change the orderID from a string to a number in base 10
        custName: args[1],
        type: args[2],
        time: Date.now()
    }
    // console.log(payload);

    // Encode the payload in a binary format
    const payloadAsBytes = cbor.encode(payload);

    // Create a transaction header (unlike the payload, we must have specific items in this one; see sawtooth docs)
    const transactionHeader = {
        familyName: 'pizzaTP',
        familyVersion: '0.1',
        inputs: ['b988b1'], //Explain in demo
        outputs: ['b988b1'],
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

    // console.log(batch);

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
    },  (err, response) => {
            if (err) return console.log(err)
            console.log(response.body)
    })

} else if (action == "update") {
    console.log("UPDATE");
} else if (action == "get") {
    console.log("GET");
    const orderID = process.argv[3]
    console.log(orderID)

    // request.get({
    //     url: 'http://localhost:8008/state',
    //     body: batchListAsBytes,
    //     headers: {'Content-Type': 'application/octet-stream'}
    // },  (err, response) => {
    //         if (err) return console.log(err)
    //         console.log(response.body)
    // })
} else {
    console.error("Valid actions are either 'create', 'update', or 'get'");
    process.exit(9); // 9 because that is what node.js uses for Invalid Args
}

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

// function generateAddress(OrderID) {
//     createHash()
// }