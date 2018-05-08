var request = require('request-promise');
var transaction = require('./TransactionCreator');

async function send(payload){
  // Create batch list
  var batchListBytes = transaction.createTransaction(payload.Action, payload.ModelID, payload.Size, payload.SkuID, payload.ProductID, payload.Date);
  // get a response use await to wait to get a response then return value
  var response = await submit(batchListBytes);
  // Error check the response
  if(!errorCheckResponse(response)){
    return response;
  }

  // Response is valid parse the value
  var transactionStatus = JSON.parse(response).link;
  var status = await getStatus(transactionStatus);
  return status;
}

// Send transaction to validator
function submit(batchListBytes){
  return request.post({
    url: 'http://localhost:8008/batches',
    body: batchListBytes,
    headers: {'Content-Type': 'application/octet-stream'}
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
    headers: {'Content-Type': 'application/json'}
  }).then(function(response){
    return response;
  }).catch(function(error){
    return error;
  });
}

// Check response status code. For some reason valid request does not return status code 202. Instead it's undefined
function errorCheckResponse(response){
  if(response.statusCode === undefined){
    return true;
  }
  if(response.statusCode === 400 || response.statusCode === 404 || response.statusCode === 500 || response.statusCode === 503){
    return false;
  }
}


module.exports={
    send,
    errorCheckResponse
}
