var request = require('request-promise');
var transaction = require('./TransactionCreator');
var addressing = require('../addressing.js')


//Address information notes
// Get the asset information. What shoe, size, etc
// localhost:8008/state/{Family Name}0{RFID hashed or something}0000

// Main history of item + other pages (touchpoints and stuff)
// localhost:8008?reverse=t&address={Family Name}1{RFID hashed or something}[{0000} or {0001} or {etc}]





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
  // Successful post request is 202 and successful get request is 200
  if(response.statusCode === 202 || response.statusCode === 200){
    return true;
  }
  else{
    return false;
  }
}



async function getTheRestOfTheHistory(address, entriesList) {
  var touchPointIndex = entriesList.entriesList[0].currTouchpointIndex;
  //var addressLength = address.length;
  //address = address.substring(0, addressLength - 4);
  var responseArray = [];
  for(var i = 1; i <= touchPointIndex; ++i) {
    //Update address for next one
    //address[0] = i;

    //Get the data for this position
    console.log(addressing.makeTouchpointAddress(address, i));
    var responseTemp = await getHistory(addressing.makeTouchpointAddress(address, i));

    //Save the data
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
    getAssetInfo
}
