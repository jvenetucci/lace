var express = require('express');
var router = express.Router();
var request = require('./request');
var address = require('../addressing');
var history_pb = require('../protobufFiles/history_pb');
const profileKey = require('../agentKeys.json');


// Creates agents and sends to validator Comment out if you dont want to add clients at start up
addAgents();

// Create a mapping of public keys to names
const publicKeyMap = mapPublicKeysToNames(profileKey)


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
    //console.log(response);
    sendResponseToClient(res, response);
});

//A Function to get the history of an item from its RFID. 
router.post('/api/history/:user', async function(req, res) {
    // get user keys
    var agentPubPriKey = getKeys(req.params.user);
        
    var response = await request.getHistory(address.makeAllHistoryAddress(req.body.RFID));
    if(!request.errorCheckResponse(response))
    {
        SendErrorReponseToClient(res);
        return;
    }

    var instanceArray = [];
    var dataList = JSON.parse(response.body).data;

    // Decode the history page container first
    var buffer = new Buffer(dataList[0].data, 'base64');
    var uInt = new Uint8Array(buffer);
    var instance = history_pb.HistoryContainer.deserializeBinary(uInt).toObject();

    // Find the correct history page in the container
    instance.entriesList.forEach(entry => {
        if (entry.rfid == req.body.RFID) {
            instanceArray[instanceArray.length] = entry;
        }
    })

    // Decode the remaining touchpoint containers
    for (i = 1; i < dataList.length; i++) {
        buffer = new Buffer(dataList[i].data, 'base64');
        uInt = new Uint8Array(buffer);
        instance = history_pb.TouchPointContainer.deserializeBinary(uInt).toObject();

        // Add an entry to the touchpoint that maps the pub key to a name
        var touchPoint = instance.entriesList[0];
        touchPoint.name = publicKeyMap.get(instanceArray[0].reporterListList[touchPoint.reporterIndex].publicKey);
        instanceArray[instanceArray.length] = touchPoint;
    }

    res.statusCode = 200;
    res.send(instanceArray);
});

router.post('/api/status/:user', async function(req, res){
    console.log(req.body.url);
    
    var response = await request.getStatus(req.body.url);

    res.statusCode = 200;
    res.send(response);
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

function mapPublicKeysToNames(profileJSON) {
    var map = new Map();
    for (var key in profileJSON) {
       if (profileJSON.hasOwnProperty(key)) {
           map.set(profileJSON[key].public_key, key)
        }
    }
    return map
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
