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


var request = require('request-promise');
var transaction = require('./TransactionCreator');
var addressing = require('../addressing.js')

// Address information notes
async function send(payload){
  var batchListBytes = transaction.createTransactionSecp(payload);
  var response = await submit(batchListBytes);
  if(!errorCheckResponse(response)){
    return response;
  }
  var status = await getStatus(JSON.parse(response.body).link + "&wait=true");
  return status;
}

// Send transaction to validator
function submit(batchListBytes){
  return request.post({
    url: process.env.REST_API_ADDRESS + '/batches',
    body: batchListBytes,
    headers: {'Content-Type': 'application/octet-stream'},
    resolveWithFullResponse: true
  }).then(function(response){
    return response;
  }).catch(function(error){
    if(error.response){
      return (error.response);
    }
  })
}

// Go to url of transaction status and return the status
async function getStatus(transactionStatus){
  return request.get({
    url: transactionStatus,
    headers: {'Content-Type': 'application/json'},
    resolveWithFullResponse: true
  }).then(function(response){
    return response;
  }).catch(function(error){
    return error;
  });
}

// Get History Of Asset, the main history page, and all touchpoints
function getHistory(addressing){
  return request.get({
    url: process.env.REST_API_ADDRESS + '/state?address=' +  addressing,
    headers: {'Content-Type': 'application/json'},
    resolveWithFullResponse: true
  }).then(function(response){
    return response;
  }).catch(function(error){
    return error;
  })
}

async function getAssetInfo(addressing){
  return request.get({
    url: process.env.REST_API_ADDRESS + '/state?address=' +  addressing,
    headers: {'Content-Type': 'application/json'},
    resolveWithFullResponse: true
  }).then(function(response){
    return response;
  }).catch(function(error){
    return error;
  })
}

function errorCheckResponse(response){
  if(response.statusCode === 202 || response.statusCode === 200){
    return true;
  }
  else{
    return false;
  }
}

async function getTheRestOfTheHistory(address, entriesList) {
  var touchPointIndex = entriesList.entriesList[0].currTouchpointIndex;
  var responseArray = [];
  for(var i = 1; i <= touchPointIndex; ++i) {
    var responseTemp = await getHistory(addressing.makeTouchpointAddress(address, i));
    responseArray[i] = responseTemp;
  }
  return responseArray;
}

module.exports={
    send,
    errorCheckResponse,
    getHistory,
    getStatus,
    getTheRestOfTheHistory,
    submit,
    getAssetInfo
}
