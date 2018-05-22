const WebSocket = require('ws');
const agentProto = require('./protobufFiles/agent_pb');
const assetProto = require('./protobufFiles/asset_pb');

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
    console.log('***data****');
    console.log(data);

    var type = JSON.parse(data).state_changes[0].address.charAt(6);
    console.log('***type****');
    console.log(type);

    var newState = JSON.parse(data).state_changes[0].value;
    console.log('***newState**** ');// + str(newState));
    console.log(newState);

    var data = Buffer.from(newState, 'base64')
    console.log('***data****');
    console.log(data);

    data = new Uint8Array(data);
    console.log('***data****' + data.length);
    // console.log(data);

    if(type == 2){
        console.log('THIS IS A NEW AGENTTTTTTTTTTTTTT');
        data = agentProto.AgentContainer.deserializeBinary(newState).toObject();
    }
    else if(type == 0) {
        console.log('THIS IS A NEW ASSETTTTTTTTTTTTTT');
        data = assetProto.AssetContainer.deserializeBinary(newState).toObject();
    }
    else {
        console.log('HISTORY');
    }
    console.log(data);
    // console.log(d2);
});

// curl --request POST --header "Content-Type: application/octet-stream" --data-binary @lace.batches "http://localhost:8008/batches"