var request = require('request-promise');
var transaction = require('./TransactionCreator');

async function send(payload){
  // Create batch list
  var batchListBytes = transaction.createTransaction(payload);
  // get a response use await to wait to get a response then return value
  var response = await submit(batchListBytes);
  // Error check the response
  if(!errorCheckResponse(response)){
    return response;
  }

  // Response is valid parse the value
  var transactionURL = JSON.parse(response.body).link;
  var status = await getStatus(transactionURL);
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
}
