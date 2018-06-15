/* Team B is comprised of the following individuals:
    - Roberto Avila
    - Andrew Burnett
    - Jeff De La Mare
    - Nick Nation
    - Phillip Nguyen
    - Anthony Tran
    - Joseph Venetucci

[This program is licensed under the "MIT License"]
Please see the file LICENSE.md in the 
source distribution of this software for license terms.

This software also makes use of Hyperledger Sawtooth which is
licensed under Apache 2.0. A copy of it's license and copyright
are contained in sawtooth-license.md and sawtooth-copyright.md */


const {createContext, CryptoFactory} = require('sawtooth-sdk/signing');
const {createHash} = require ('crypto');
const {protobuf} = require('sawtooth-sdk');
const crypto = require('crypto');

const request = require('request');

const txns = require("../server/routes/TransactionCreator")
const addressing =  require('../server/addressing');
const payload_pb = require('./payload_pb');
const Secp256k1PrivateKey = require('sawtooth-sdk/signing/secp256k1');

const keys = require('../server/agentKeysExtended.json')

const fs = require('fs')

const FAMILY_NAME = 'lace';
const FAMILY_VERSION = '0.1'
const NAMESPACE_PREFIX = '22a6ae'

const assetNumber = process.argv[2];

// 3 factories
// 1 owner
// 5 shippers
// 2 distribution centers
// 5 stores
// each store has 2 registers


// **** REST API ADDRESSES ***
const ports = ['8008', '8001', '8002', '8003', '8004']
// **** SKU and Size List ****
const SKUList = ['942838', '844687', 'AA1253', '942851']
const sizeList = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12', '12.5', '13', '14']

// **** Date List ****
// Tue, 01 May 2018 10:14:23 GMT
// Thu, 26 Apr 2018 12:34:12 GMT
// Wed, 02 May 2018 14:09:09 GMT
const orderDateList = [
    Date.UTC(2018, 4, 1, 10, 14, 23, 546),
    Date.UTC(2018, 3, 26, 12, 34, 12, 349),
    Date.UTC(2018, 4, 2, 14, 9, 9, 846)
]

// Wed, 09 May 2018 08:06:33 GMT
// Wed, 09 May 2018 08:36:53 GMT
// Wed, 09 May 2018 08:54:11 GMT
// Wed, 09 May 2018 09:06:13 GMT
// Wed, 09 May 2018 09:32:53 GMT
// Fri, 11 May 2018 14:24:12 GMT
// Fri, 11 May 2018 15:40:12 GMT
// Fri, 11 May 2018 16:02:29 GMT
const creationDateList = [
    Date.UTC(2018, 4, 9, 8, 6, 33, 946),
    Date.UTC(2018, 4, 9, 8, 36, 53, 146),
    Date.UTC(2018, 4, 9, 8, 54, 11, 48),
    Date.UTC(2018, 4, 9, 9, 6, 13, 226),
    Date.UTC(2018, 4, 9, 9, 32, 53, 19),
    Date.UTC(2018, 4, 11, 14, 24, 12, 349),
    Date.UTC(2018, 4, 11, 15, 40, 12, 211),
    Date.UTC(2018, 4, 11, 16, 2, 29, 739)
]

// Mon, 14 May 2018 04:34:13 GMT
// Mon, 14 May 2018 06:04:21 GMT
// Mon, 14 May 2018 11:30:09 GMT
// Mon, 14 May 2018 14:06:51 GMT
const shipper1DateList = [
    Date.UTC(2018, 4, 14, 4, 34, 13, 987),
    Date.UTC(2018, 4, 14, 6, 4, 21, 296),
    Date.UTC(2018, 4, 14, 11, 30, 9, 99),
    Date.UTC(2018, 4, 14, 14, 6, 51, 3),
]

// Fri, 18 May 2018 02:04:18 GMT
// Fri, 18 May 2018 03:11:41 GMT
// Sat, 19 May 2018 09:01:09 GMT
// Sat, 19 May 2018 17:39:11 GMT
const shipper2DateList = [
    Date.UTC(2018, 4, 18, 2, 4, 18, 187),
    Date.UTC(2018, 4, 18, 3, 11, 41, 796),
    Date.UTC(2018, 4, 19, 9, 1, 9, 299),
    Date.UTC(2018, 4, 19, 17, 39, 11, 381)
]

// Tue, 22 May 2018 06:39:37 GMT
// Tue, 22 May 2018 06:54:13 GMT
// Tue, 22 May 2018 08:29:31 GMT
// Tue, 22 May 2018 15:49:47 GMT
const distributionDateList = [
    Date.UTC(2018, 4, 22, 6, 39, 37, 789),
    Date.UTC(2018, 4, 22, 6, 54, 13, 75),
    Date.UTC(2018, 4, 23, 8, 29, 31, 79),
    Date.UTC(2018, 4, 23, 15, 49, 47, 435),
]

// Thu, 24 May 2018 04:27:43 GMT
// Thu, 24 May 2018 06:10:19 GMT
// Sat, 26 May 2018 08:32:18 GMT
const storeArrivalDateList = [
    Date.UTC(2018, 4, 24, 4, 27, 43, 284),
    Date.UTC(2018, 4, 24, 6, 10, 19, 81),
    Date.UTC(2018, 4, 26, 8, 32, 18, 224),
]

// Tue, 29 May 2018 14:42:40 GMT
// Wed, 30 May 2018 16:02:38 GMT
// Thu, 31 May 2018 11:54:32 GMT
const storeNextDateList = [
    Date.UTC(2018, 4, 29, 14, 42, 40, 201),
    Date.UTC(2018, 4, 30, 16, 2, 38, 340), 
    Date.UTC(2018, 4, 31, 11, 54, 32, 801)
]


// **** Company ****
var PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["Company"].private_key);
const signerCompany = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);

// **** Factories ****
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["FactoryA"].private_key);
const signerFA = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["FactoryB"].private_key);
const signerFB = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);

const factories = [signerFA, signerFB];

// **** Shipping ****
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["ShipperBoat1"].private_key);
const signerSB1 = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["ShipperTruck3"].private_key);
const signerST3 = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["ShipperTruck1"].private_key);
const signerST1 = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["ShipperTruck2"].private_key);
const signerST2 = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["ShipperPlane1"].private_key);
const signerSP1 = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);

const shipping1 = [signerSB1, signerST2, signerSP1]
const shipping2 = [signerST1, signerST3]

// **** Distribution Centers ****
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["DistributionCenterA"].private_key);
const signerDA = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["DistributionCenterB"].private_key);
const signerDB = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);

const distributionCenters = [signerDA, signerDB]

// **** Stores *****
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["StoreA"].private_key);
const signerStoreA = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);

PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["StoreB"].private_key);
const signerStoreB = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);

PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["StoreA-Backroom"].private_key);
const signerStoreABackroom = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["StoreA-Register1"].private_key);
const signerStoreAR1 = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["StoreA-Register2"].private_key);
const signerStoreAR2 = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);

const storeAAreas = [signerStoreABackroom, signerStoreAR1, signerStoreAR2]

PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["StoreB-Backroom"].private_key);
const signerStoreBBackroom = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["StoreB-Register1"].private_key);
const signerStoreBR1 = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(keys["StoreB-Register2"].private_key);
const signerStoreBR2 = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);

const storeBAreas = [signerStoreBBackroom, signerStoreBR1, signerStoreBR2]

docRFID = fs.openSync('./RFIDList.lace', 'a');

var transactions = [];
var count = 0;

// ****** Main Body ******
for (var i = 0; i < assetNumber; i++) {

    var path = "Order"
    count += 3;
    var RFID = getRandomRFID();
    var size = getRandomSize();
    var SKU = getRandomSKU();
    console.log(i + ": " + RFID + " -> " + SKU + " -> " + size)
    // fs.writeSync(docRFID, RFID + ' -> ' + SKU + ' -> ' + size + '\n')

    var newAsset = new payload_pb.CreateAssetAction()
    newAsset.setRfid(RFID);
    newAsset.setSize(size);
    newAsset.setSku(SKU);
    newAsset.setLongitude(0);
    newAsset.setLatitude(0);

    var payload = new payload_pb.Payload();
    payload.setAction(0);
    payload.setTimestamp(orderDateList[getRandomIntInclusive(0, (orderDateList.length - 1))]);
    payload.setCreateAsset(newAsset);

    var transactionBytes = txns.createTransactionBytes(signerCompany, signerCompany, payload.serializeBinary())
    transactions[transactions.length] = transactionBytes;
    // var batchBytes = createBatchListBytes(signerCompany, signerCompany.getPublicKey().asHex(), payload.serializeBinary());

    // 95% to get created at factory
    if (getRandomIntInclusive(0,100) > 5) {
        path = path + " -> Manufacture"
        count += 1;

        var createTouch = new payload_pb.TouchAssetAction();
        createTouch.setRfid(RFID);
        createTouch.setLongitude(0);
        createTouch.setLatitude(0);

        payload = new payload_pb.Payload();
        payload.setAction(2);
        payload.setTimestamp(creationDateList[getRandomIntInclusive(0, (creationDateList.length - 1))]);
        payload.setTouchAsset(createTouch);

        factory = factories[getRandomIntInclusive(0, (factories.length - 1))]

        transactionBytes = txns.createTransactionBytes(factory, signerCompany, payload.serializeBinary())
        transactions[transactions.length] = transactionBytes;
        // batchBytes = createBatchListBytes(factory, factory.getPublicKey().asHex(), payload.serializeBinary())

        // 90% chance to leave factory
        if (getRandomIntInclusive(0,100) > 10) {
            path = path + " -> Shipping1"
            count += 1;

            createTouch = new payload_pb.TouchAssetAction();
            createTouch.setRfid(RFID);
            createTouch.setLongitude(0);
            createTouch.setLatitude(0);

            payload = new payload_pb.Payload();
            payload.setAction(2);
            payload.setTimestamp(shipper1DateList[getRandomIntInclusive(0, (shipper1DateList.length - 1))]);
            payload.setTouchAsset(createTouch);

            shipper1 = shipping1[getRandomIntInclusive(0, (shipping1.length - 1))]

            transactionBytes = txns.createTransactionBytes(shipper1, signerCompany, payload.serializeBinary())
            transactions[transactions.length] = transactionBytes;
            // batchBytes = createBatchListBytes(shipper1, shipper1.getPublicKey().asHex(), payload.serializeBinary());

            
            // 70% change to go to a second shipper  
            if (getRandomIntInclusive(0,100) > 30) {
                path = path + " -> Shipping2"
                count += 1;

                createTouch = new payload_pb.TouchAssetAction();
                createTouch.setRfid(RFID);
                createTouch.setLongitude(0);
                createTouch.setLatitude(0);

                payload = new payload_pb.Payload();
                payload.setAction(2);
                payload.setTimestamp(shipper2DateList[getRandomIntInclusive(0, (shipper2DateList.length - 1))]);
                payload.setTouchAsset(createTouch);

                shipper2 = shipping2[getRandomIntInclusive(0, (shipping2.length - 1))]

                transactionBytes = txns.createTransactionBytes(shipper2, signerCompany, payload.serializeBinary())
                transactions[transactions.length] = transactionBytes;
                // batchBytes = createBatchListBytes(shipper2, shipper2.getPublicKey().asHex(), payload.serializeBinary());

                // 80% chance to go to distribution center
                if (getRandomIntInclusive(0,100) > 20) {
                    path = path + " -> Distribution Center"
                    count += 1;

                    createTouch = new payload_pb.TouchAssetAction();
                    createTouch.setRfid(RFID);
                    createTouch.setLongitude(0);
                    createTouch.setLatitude(0);

                    payload = new payload_pb.Payload();
                    payload.setAction(2);
                    payload.setTimestamp(distributionDateList[getRandomIntInclusive(0, (distributionDateList.length - 1))]);
                    payload.setTouchAsset(createTouch);

                    distributor = distributionCenters[getRandomIntInclusive(0, (distributionCenters.length - 1))]
                    
                    transactionBytes = txns.createTransactionBytes(distributor, signerCompany, payload.serializeBinary())
                    transactions[transactions.length] = transactionBytes;
                    // batchBytes = createBatchListBytes(distributor, distributor.getPublicKey().asHex(), payload.serializeBinary())


                    // 60% chance to go to store
                    if (getRandomIntInclusive(0,100) > 40) {
                        path = path + " -> Store"
                        count += 1;

                        createTouch = new payload_pb.TouchAssetAction();
                        createTouch.setRfid(RFID);
                        createTouch.setLongitude(0);
                        createTouch.setLatitude(0);

                        payload = new payload_pb.Payload();
                        payload.setAction(2);
                        payload.setTimestamp(storeArrivalDateList[getRandomIntInclusive(0, (storeArrivalDateList.length - 1))]);
                        payload.setTouchAsset(createTouch);

                        storeChoice = getRandomIntInclusive(0,1);
                        if (storeChoice == 1) {
                            store = signerStoreA;
                            
                            transactionBytes = txns.createTransactionBytes(store, signerCompany, payload.serializeBinary())
                            transactions[transactions.length] = transactionBytes;
                            // batchBytes = createBatchListBytes(store, store.getPublicKey().asHex(), payload.serializeBinary());


                            // 70% chance to go someplace in store
                            if (getRandomIntInclusive(0,100) > 30) {
                                path = path + " -> Store Next"
                                count += 1;

                                createTouch = new payload_pb.TouchAssetAction();
                                createTouch.setRfid(RFID);
                                createTouch.setLongitude(0);
                                createTouch.setLatitude(0);

                                payload = new payload_pb.Payload();
                                payload.setAction(2);
                                payload.setTimestamp(storeNextDateList[getRandomIntInclusive(0, (storeNextDateList.length - 1))]);
                                payload.setTouchAsset(createTouch);

                                next = storeAAreas[getRandomIntInclusive(0, (storeAAreas.length -1))]
                                
                                transactionBytes = txns.createTransactionBytes(next, signerCompany, payload.serializeBinary())
                                transactions[transactions.length] = transactionBytes;
                                // batchBytes = createBatchListBytes(next, next.getPublicKey().asHex(), payload.serializeBinary())

                            }
                        } else {
                            store = signerStoreB;

                            transactionBytes = txns.createTransactionBytes(store, signerCompany, payload.serializeBinary())
                            transactions[transactions.length] = transactionBytes;
                            // batchBytes = createBatchListBytes(store, store.getPublicKey().asHex(), payload.serializeBinary())


                            // 60% chance to go someplace in store
                            if (getRandomIntInclusive(0,100) > 40) {
                                path = path + " -> Store Next"
                                count += 1;

                                createTouch = new payload_pb.TouchAssetAction();
                                createTouch.setRfid(RFID);
                                createTouch.setLongitude(0);
                                createTouch.setLatitude(0);

                                payload = new payload_pb.Payload();
                                payload.setAction(2);
                                payload.setTimestamp(storeNextDateList[getRandomIntInclusive(0, (storeNextDateList.length - 1))]);
                                payload.setTouchAsset(createTouch);

                                next = storeBAreas[getRandomIntInclusive(0, (storeBAreas.length -1))]

                                transactionBytes = txns.createTransactionBytes(next, signerCompany, payload.serializeBinary())
                                transactions[transactions.length] = transactionBytes;
                                // batchBytes = createBatchListBytes(next, next.getPublicKey().asHex(), payload.serializeBinary())

                            }
                        }
                    }
                }
            }
        }
    }
    console.log(path + "\n")
    // var batchBytes = txns.createBatchListBytesFromMany(signerCompany, transactions)
    // request.post({
    //     url: 'http://localhost:' + ports[getRandomIntInclusive(0, (ports.length - 1))] + '/batches',
    //     body: batchBytes,
    //     headers: {'Content-Type': 'application/octet-stream'}
    // },  (err, response, responseBody) => {
    //     if (err) {
    //         return console.log("Problem submitting to the validator...\n" + err)
    //     } else {
    //         getStatus(JSON.parse(responseBody).link)
    //     }
    // })
    // transactions = []
}
console.log("*** Randomly generated the supply chain lifecycle for " + assetNumber + " assets with a total of " + count + " transactions" )
var batchBytes = txns.createBatchListBytesFromMany(signerCompany, transactions)
request.post({
    url: 'http://localhost:' + ports[getRandomIntInclusive(0, (ports.length - 1))] + '/batches',
    body: batchBytes,
    headers: {'Content-Type': 'application/octet-stream'}
},  (err, response, responseBody) => {
    if (err) {
        return console.log("Problem submitting to the validator...\n" + err)
    } else {
        getStatus(JSON.parse(responseBody).link)
    }
})



function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function getRandomRFID() {
    RFID = getRandomIntInclusive(1000, 10000);
    RFID = crypto.createHash('sha512').update(RFID.toString()).digest("hex");
    return RFID.slice(0,24);
}

function getRandomSKU() {
    SKU = SKUList[getRandomIntInclusive(0,(SKUList.length - 1))];
    return SKU;
}

function getRandomSize() {
    size = sizeList[getRandomIntInclusive(0, (sizeList.length - 1))];
    return size;
}

function send(batchListAsBytes) {
    request.post({
        url: 'http://localhost:' + ports[getRandomIntInclusive(0, (ports.length - 1))] + '/batches',
        body: batchListAsBytes,
        headers: {'Content-Type': 'application/octet-stream'}
    },  (err, response, responseBody) => {
        if (err) {
            // return console.log("Problem submitting to the validator...\n" + err)
        } else {
        }
    })
}

function getStatus(url) {
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
            console.log("ERROR: " + msg.data[0].invalid_transactions[0].message)
        } else if (batchStatus == 'COMMITTED'){
            console.log("COMMITTED!")
        }
    })
}

// function createBatchListBytes(signer, transactionList){
//     var batchHeader = {
//         signerPublicKey: signer.getPublicKey().asHex(),
//         transactionIds: transactionList.map((txn) => txn.headerSignature)
//     };

//     const batchHeaderBytes = protobuf.BatchHeader.encode(batchHeader).finish();
    
//     const batchSignature = signer.sign(batchHeaderBytes);
    
//     const batch = protobuf.Batch.create({
//         header: batchHeaderBytes,
//         headerSignature: batchSignature,
//         transactions: transactionList
//     });
 

//     const batchListBytes = protobuf.BatchList.encode({
//         batches: [batch]
//     }).finish();
//     return batchListBytes;
// }

//     const context = createContext('secp256k1');
//     var privateKey = context.newRandomPrivateKey();
//     var signer = new CryptoFactory(context).newSigner(privateKey)

// for (var i = 0; i < 13; i++) {
//     console.log("********")
//     console.log(privateKey.asHex())
//     console.log(signer.getPublicKey().asHex())
//     privateKey = context.newRandomPrivateKey();
//     signer = new CryptoFactory(context).newSigner(privateKey)
//     console.log("********")
// }