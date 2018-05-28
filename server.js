// to run npm run dev
//import express
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const agentProto = require('./protobufFiles/agent_pb');
const assetProto = require('./protobufFiles/asset_pb');
const historyProto = require('./protobufFiles/history_pb');
const db = require('./db');


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
    console.log('\n\n****************************************');
    console.log('**************START OF TRANSACTION**************\n');

    var parsed_data = JSON.parse(data);

    console.log('STATE CHANGES:');
    for(i in parsed_data.state_changes) {
        console.log(parsed_data.state_changes[i]);
    }

    var numStateChanges = parsed_data.state_changes.length;
    console.log('\n- Number of state changes: ' + numStateChanges);

    var block_num = parsed_data.block_num;
    console.log('- BLOCK: ' + block_num);

    if (block_num == 0) {
        console.log('****************************************');
        return;
    }

    const types = ['ASSET', 'TOUCH/HISTORY', 'AGENT'];
    var type = parsed_data.state_changes[0].address.charAt(6);
    console.log('- TYPE: ' + types[type]);

    console.log('\n--------------------------------');
    console.log('-----START OF TRANSACTION EXTRACTION');

    for(i in parsed_data.state_changes) {
        console.log('=============');

        var subtype = parsed_data.state_changes[i].address.charAt(6);
        console.log('Subtype: ' + subtype + '\n');

        var new_state = parsed_data.state_changes[i].value;
        data = Buffer.from(new_state, 'base64');
        data = new Uint8Array(data);

        if (subtype == '0') {
            data = assetProto.AssetContainer.deserializeBinary(new_state).toObject();
            console.log('AN ASSET');
            console.log(data);
        }
        else if (subtype == '1') {
            // history if last four chars of address == 0000
            if (parsed_data.state_changes[i].address.slice(-4) == '0000') {
                data = historyProto.HistoryContainer.deserializeBinary(new_state).toObject();
                console.log('A HISTORY');
                // console.log(historyProto.History.deserializeBinary(new_state).toObject());
                console.log(data);
            }
            else {
                data = historyProto.TouchPointContainer.deserializeBinary(new_state).toObject();
                console.log('A TOUCH');
            }
            console.log(data);
        }
        else if (subtype == '2') {
            data = agentProto.AgentContainer.deserializeBinary(new_state).toObject();
            console.log('AN AGENT');
            console.log(data);
        }
        console.log('=============');
    }
    console.log('--------------------------------');
    console.log('--------------------------------');

    console.log('****************************************');
    console.log('****************************************');
    console.log('\n\n');
});