// Request
var request = require('request');
var transaction = require('./TransactionCreator');

function send(payload){
    var batchListBytes = transaction.createTransaction(payload.Action, payload.ModelID, payload.Size, payload.SkuID, payload.ProductID, payload.Date);
    var response = submit(batchListBytes);
}

function submit(batchListBytes){
    request.post({
      url: 'http://localhost:8008/batches',
      body: batchListBytes,
      headers: {'Content-Type': 'application/octet-stream'}
    }, (err, response) => {
      if (err){
        console.log("error");
        return console.log(err)
      } 
      // will do a switch for status code or function but for now
      if(response.statusCode === 202)
      {
        console.log("Success ", response.body);
        return response.body;
      }
      else if(response.statusCode === 400)
      {
        console.log("Bad Request. Bad Formatted ");
        return;
      }
      else if(response.statusCode === 404)
      {
        console.log("Not Found");
        return;
      }
      else if(response.statusCode === 500)
      {
        console.log("Something is broken in REST API or validator");
        return;
      }
      else if(response.statusCode === 503)
      {
        console.log("Service unavailable. Cant REST API can't communicate with validator");
        return;
      }
    })
  }

module.exports={
    send,
    submit
}
