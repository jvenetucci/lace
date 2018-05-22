var express = require('express');
var router = express.Router();
var request = require('./request');
var address = require('../addressing');
var history_pb = require('../protobufFiles/history_pb');
const profileKey = require('../agentKeys.json');


// Creates agents and sends to validator Comment out if you dont want to add clients at start up
addAgents();


// Make request on server end
router.post('/api/send/:user', async function(req, res){
    // get user parameter
    var agentPubPriKey = getKeys(req.params.user); 

    // create payload
    var payload = {
        Action: 0,
        ModelID: req.body.model,
        Size: req.body.size,
        SkuID: req.body.sku,
        RFID: req.body.rfid,
        Date: req.body.date,
        PublicKey: agentPubPriKey["public_key"],
        PrivateKey: agentPubPriKey["private_key"]
    }

    // make request to send transaction to validator
    var response = await request.send(payload);
    sendResponseToClient(res, response);
});

router.post('/api/touch/:user', async function(req, res){
    // get keys
    var agentPubPriKey = getKeys(req.params.user);

    // create payload
    var payload = {
        Action: 2,
        RFID: req.body.rfid,
        PublicKey: agentPubPriKey["public_key"],
        PrivateKey: agentPubPriKey["private_key"]
    }
    var response = await request.send(payload);
    console.log(response);
    sendResponseToClient(res, response);
});

//A Function to get the history of an item from its RFID. 
router.post('/api/history/:user', async function(req, res) {
    // get user keys
    var agentPubPriKey = getKeys(req.params.user);
        
    var response = await request.getHistory(address.makeHistoryAddress(req.body.RFID));
    if(!request.errorCheckResponse(response))
    {
        SendErrorReponseToClient(res);
        return;
    }

    // Decode the response
    var buffer = new Buffer(JSON.parse(response.body).data, 'base64');
    var uInt = new Uint8Array(buffer);
    var instance = history_pb.HistoryContainer.deserializeBinary(uInt).toObject();

    //console.log(instance["entriesList"][0]["reporterListList"]);
    console.log(instance);

    res.statusCode = 200;
    res.send(instance);
    
});





function SendErrorReponseToClient(res){
    // send back to the client with the status code error
    res.statusCode = response.statusCode;
    res.send("Invalid request status Code " + response.statusCode);
    res.end;
}

function getKeys(agent){
    return(profileKey[agent]);
}

function sendResponseToClient(res, response){
    if(!request.errorCheckResponse(response))
    {
        SendErrorReponseToClient(res);
        return;
    }

    res.statusCode = 200;
    res.send(response.body);
}

function addAgents(){
    var payload = {
        Action: 1,
        Name: "",
        PublicKey: "",
        PrivateKey: "",
    }
    for(var agent in profileKey){
        payload.Name = agent;
        payload.PublicKey = (profileKey[agent]["public_key"]);
        payload.PrivateKey = (profileKey[agent]["private_key"]);
        request.send(payload);
    }
}

module.exports = router;
