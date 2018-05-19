
const {createHash} = require('crypto');
const {protobuf} = require('sawtooth-sdk');
const cbor = require('cbor');

const addressing =  require('../addressing.js');
const asset_pb = require('../protobufFiles/asset_pb');
const agent_pb = require('../protobufFiles/agent_pb');
const history_pb = require('../protobufFiles/history_pb');
const payload_pb = require('../protobufFiles/payload_pb');
const Secp256k1PrivateKey = require('sawtooth-sdk/signing/secp256k1');
const {createContext, CryptoFactory} = require('sawtooth-sdk/signing');

const context = createContext('secp256k1');

//Here we go, using the actual protobuf stuff from backend to build a transaction. 
//Arg1: the payload object to be sent
//Arg2: some way to indicate the private key of the client. 
//      Could be a name that we consult a map to get the private key, 
//      or maybe it is just the private key, or maybe a signer object, whatever.
//Returns: A batch containing the transaction made from payload.
function createTransactionSecp(payload, tempPrivateKeyTemp) {
    var PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(tempPrivateKeyTemp);
    const signer = new CryptoFactory(context).newSigner(PKGen);

    console.log('Private key: ' + PKGen.asHex());
    console.log('Public key:  ' + signer.getPublicKey().asHex());
    //Create Asset
    if(payload.Action === 0) {
        var createAsset = new payload_pb.CreateAssetAction();

        createAsset.setRfid(payload.ModelID);
        createAsset.setSize(payload.Size);
        createAsset.setSku(payload.SkuID);

        var payloadToSend = new payload_pb.Payload();
        payloadToSend.setAction(payload.Action);
        payloadToSend.setTimestamp((new Date).getTime());
        payloadToSend.setCreateAsset(createAsset);
        console.log(payloadToSend.toObject());

        var payloadBytes = payloadToSend.serializeBinary(); //asset_pb.serializeBinary();

    //Create Agent Action    
    } else if(payload.Action === 1) {
        var createAgent = new payload_pb.CreateAgentAction();

        createAgent.setName(payload.Name);
        createAgent.setPublicKey(signer.getPublicKey().asHex());
        //createAgent.setRole(1);

        var payloadToSend = new payload_pb.Payload();
        payloadToSend.setAction(payload.Action);
        payloadToSend.setTimestamp((new Date).getTime());
        payloadToSend.setCreateAgent(createAgent);
        console.log(payloadToSend.toObject());

        var payloadBytes = payloadToSend.serializeBinary(); //agent_pb.serializeBinary(createAgentPayload);

    //Touch Asset Action
    } else if(payload.Action === 2) {
        console.log('DO NOT TRY TOUCH, IT DOES NOT WORK')
        var touchAssetInformation = {
            rfid: payload.ModelID,
            longitude: (Math.random()*180),
            latitude: (Math.random()*180)
        };

        var touchAssetPayload = Payload.TouchAssetAction({
            action: payload.Action,
            timestamp: (new Date).getTime(),
            create_asset: touchAssetInformation
        });

        var payloadBytes = Payload.TouchAssetAction.serializeBinary(touchAssetPayload);
    } else {
        payloadBytes = 'Ya done goofed; ya goofed real bad.';
    }

    const header = {
        family_name: 'lace',
        family_version: '0.1',
        inputs: ['22a6ae'],
        outputs: ['22a6ae'],
        signer_public_key: signer.getPublicKey().asHex(),
        batcher_public_key: signer.getPublicKey().asHex(),
        dependencies: [],
        payload_sha512: createHash('sha512').update(payloadBytes).digest('hex')
    };

    console.log(header.signer_public_key);
    console.log(header.signer_public_key.length);
    
    txn_header_bytes = protobuf.TransactionHeader.encode(header).finish();

    const signature = signer.sign(txn_header_bytes);

    //Test.py has more stuff here about ecdsa signing.
    //Hoping this works as is.
    const signedHeader = signer.sign(txn_header_bytes);

    var txn = protobuf.Transaction.create({
        header: txn_header_bytes,
        header_signature: signedHeader,
        payload: payloadBytes
    });

    var txns = [txn];

    var batchHeaderObj = {
        signer_public_key: signer.getPublicKey().asHex(),
        transaction_ids: txns.map((txn) => txn.header_signature)
    };

    console.log(batchHeaderObj);

    const batchHeaderBytes = protobuf.BatchHeader.encode(batchHeaderObj).finish();
    
    //Same thing with ecdsa here as above.
    const batchSignature = signer.sign(batchHeaderBytes);
    
    const batch = protobuf.Batch.create({
        header: batchHeaderBytes,
        header_signature: batchSignature,
        transactions: txns
    });
 
    console.log(batch);

    const batchListBytes = protobuf.BatchList.encode({
        batches: [batch]
    }).finish();
 
    return batchListBytes;
}


//Function creates a transaction 
//Input: String for: 0) Kind of action that you are doing 1) shoe type 2) shoe size 3) sku 4) RFID#
//Output: A single transaction object ready to be batched and sent. 
function createTransaction(payload) {
    return 'Wrong function';
};

module.exports = {
    createTransaction,
    createTransactionSecp
}










