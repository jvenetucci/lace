var request = require('request-promise');
var transaction = require('./TransactionCreator');


//Address information notes
// Get the asset information. What shoe, size, etc
// localhost:8008/state/{Family Name}0{RFID hashed or something}0000

// Main history of item + other pages (touchpoints and stuff)
// localhost:8008?reverse=t&address={Family Name}1{RFID hashed or something}[{0000} or {0001} or {etc}]

//TEST CODE, DELETE LATER
//A temporary thing here to be the key and name for the agent.
var agent = {
  name: 'Agent Smith',
  privateKey: '41b6c45f8138da9e6c3e6978a67509fd01acfec753fc4dfdc1d5cd08a59ac551',
  made_yet: false
};




async function send(payload){
  //TEST CODE, DELETE LATER
  //This makes the agent so we can try out the code to add the asset.
  //if(agent.made_yet === false) {
    var batchListBytes = transaction.createTransactionSecp({
      Action: 1,
      Name: agent.name
    }, agent.privateKey);
    //agent.made_yet = true;
    // get a response use await to wait to get a response then return value
    var response = await submit(batchListBytes);
  //}

  // Create batch list
  var batchListBytes = transaction.createTransactionSecp(payload, agent.privateKey);
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
