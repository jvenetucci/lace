

'use strict'


const {createContext, CryptoFactory} = require('sawtooth-sdk/signing');
const {createHash} = require ('crypto');
const {protobuf} = require('sawtooth-sdk');
const cbor = require('cbor');
const request = require('request');
//const transaction = require('./transaction')


//Create the Batch Header
const transactions = [transactionBatch]
const batchHeaderByters = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn) => txn.headerSignature),
}).finish()


// Create The Signature
const signature = signer.sign(batchHeaderBytes)

// Create The Batch
const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: signature,
    transactions: transactions
})

// Encode Batch
const batchListBytes = protobuf.BatchList.encode({
  batches: [batch]
}).finish();

// Function submit
function submit(){
  const request = require('request')
  request.post({
    url: 'http://localhost:8008/batches',
    body: batchListBytes,
    headers: {'Content-Type': 'application/octet-stream'}
  }, (err, response) => {
    if (err) return console.log(err)
    if(response.statusCode == 200) console.log("Success");
    console.log(response.body)
  })
}
submit();
