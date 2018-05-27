const request = require('request');
const transaction = require('./TransactionCreator')

// Function submit
function submit(batchListBytes){
  // const request = require('request')
  request.post({
    url: 'http://localhost:8008/batches',
    body: batchListBytes,
    headers: {'Content-Type': 'application/octet-stream'}
  }, (err, response) => {
    if (err) return console.log(err)
    if(response.statusCode === 200) console.log("Success");
    console.log(response.body)
  })
}

function createTransaction(action, productModel, productSize, productSku, productId, productManDate) {
  const batchListBytes = transaction.createTransaction(action, productModel, productSize, productSku, productId, productManDate);
  submit(batchListBytes);
}

module.exports = {
  createTransaction
}