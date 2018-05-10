var express = require('express');
var router = express.Router();
var request = require('./request');

// Make request on server end
router.post('/api/send', async function(req, res){
    var payload = {
        Action: 0,
        ModelID: req.body.model,
        Size: req.body.size,
        SkuID: req.body.sku,
        ProductID: req.body.product,
        Date: req.body.date
    }
    // make request to send transaction to validator
    var response = await request.send(payload);
    // Error check the status code
    if(!request.errorCheckResponse(response))
    {
        // send back to the client with the status code error
        res.statusCode = response.statusCode;
        res.send("Invalid request status Code " + response.statusCode);
        res.end;
        return;
    }
    res.statusCode = 200;
    res.send(response);
});

router.post('/owner/touch', async function(req, res){
    var payload = {
        Action: 1,
        AssetID: req.body.assetID,
        TransferDate: req.body.transferDate
    }
    var response = await request.send(payload);
    if(!request.errorCheckResponse(response))
    {
        // send back to the client with the status code error
        res.statusCode = response.statusCode;
        res.send("Invalid request status Code " + response.statusCode);
        res.end;
        return;
    }
    res.statusCode = 200;
    res.send(response);
});

module.exports = router;