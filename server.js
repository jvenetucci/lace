// to run npm run dev
//import express
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const agentProto = require('./protobufFiles/agent_pb');
const assetProto = require('./protobufFiles/asset_pb');


// call express
const app = express();

// used for parsing information from websites
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// get routes from file and use route
var routes = require('./routes/index');
app.use('/', routes);

app.set('port', process.env.PORT || 5001);

var server = app.listen(app.get('port'), function(){
    console.log("app started on environment port or", app.get('port'));
})


// Create websocket to the rest API
const ws = new WebSocket('ws:localhost:8008/subscriptions', {
    perMessageDeflate: false
});
// Set the websocket to listen for any state changes involving the lace transacton processor
ws.on('open', function open() {
    ws.send(JSON.stringify({
        'action': 'subscribe',
        'address_prefixes': ['22a6ae']
    }))
});

// When new messages are received do this...
// In this example, grab new value and print to console
ws.on('message', function incoming(data) {
    console.log(data);

    var type = JSON.parse(data).state_changes[0].address.charAt(6);
    console.log('TYPE: ' + type);
    
    var newState = JSON.parse(data).state_changes[0].value;

    var data = Buffer.from(newState, 'base64')

    data = new Uint8Array(data);

    console.log('I AM HERE****');
    if(type == '2'){
        console.log('THIS IS A NEW AGENTTTTTTTTTTTTTT');
        data = agentProto.AgentContainer.deserializeBinary(newState).toObject();
        console.log(data);

    }
    else if(type == '0') {
        console.log('THIS IS A NEW ASSETTTTTTTTTTTTTT');
        data = assetProto.AssetContainer.deserializeBinary(newState).toObject();
        console.log(data);

    }
    else {
        console.log('THIS IS HISTORY');
    }
    console.log('\n\n');
});