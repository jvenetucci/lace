var express = require('express');
var router = express.Router();
var request = require('./request');

router.post('/api/send', function(req, res){
    var payload = {
        Action: req.body.action,
        ModelID: req.body.model,
        Size: req.body.size,
        SkuID: req.body.sku,
        ProductID: req.body.product,
        Date: req.body.date
    }
    var value = request.send(payload);
    //console.log(value);
    res.redirect('/');
});

router.get('/sending', function(req, res){
    console.log("hello");
});

module.exports = router;