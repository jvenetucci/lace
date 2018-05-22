var request = require('request-promise');
var transaction = require('./TransactionCreator');


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

  var status = await getStatus(JSON.parse(response.body).link);
  return status;
}

// Send transaction to validator
function submit(batchListBytes){
  return request.post({
    url: 'http://localhost:8008/batches',
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
function getStatus(transactionStatus){
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

// Get History Of Asset 
function getHistory(addressing){
  return request.get({
    url: "http://localhost:8008/state/" +  addressing,
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




module.exports={
    send,
    errorCheckResponse,
    getHistory
}
