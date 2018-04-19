

'use strict'


const {createContext, CryptoFactory} = require('sawtooth-sdk/signing');
const {createHash} = require ('crypto');
const {protobuf} = require('sawtooth-sdk');
const cbor = require('cbor');
const request = require('request');
const transaction = require('./TransactionCreator')

const batchListBytes = transaction.createTransaction("Create", "Jordans", "10.0", "122X32", "11111", "04/19/2018");

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
