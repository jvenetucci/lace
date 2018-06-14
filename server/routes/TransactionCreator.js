const {createHash} = require('crypto');
const {protobuf} = require('sawtooth-sdk');

const addressing =  require('../addressing.js');
const payload_pb = require('../protobufFiles/payload_pb');
const Secp256k1PrivateKey = require('sawtooth-sdk/signing/secp256k1');
const {createContext, CryptoFactory} = require('sawtooth-sdk/signing');

const FAMILY_NAME = 'lace';
const FAMILY_VERSION = '0.1'
const NAMESPACE_PREFIX = '22a6ae'


//Returns: A batch containing the transaction made from payload.
function createTransactionSecp(payload) {
    var PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(payload.PrivateKey);
    const signer = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);

    if(payload.Action === 0)
    {
        var createAsset = initializeAsset(payload);
        var payloadToSend = initializeSendPayload(payload, createAsset);      
    }
    else if(payload.Action === 1)
    {
        var createAgent = initializeAgent(payload);
        var payloadToSend = initializeSendPayload(payload, createAgent);
    }
    else if(payload.Action === 2)
    {
        var createTouch = initializeTouch(payload);
        var payloadToSend = initializeSendPayload(payload, createTouch);
    }
    else{ return; }

    return createBatchListBytes(signer, payload.PublicKey, payloadToSend.serializeBinary());
}


//Function creates a transaction 
//Input: String for: 0) Kind of action that you are doing 1) shoe type 2) shoe size 3) sku 4) RFID#
//Output: A polite error message. 
function createTransaction(payload) {
    if(payload.Action === 0)
    {
        var createAsset = initializeAsset(payload);
        var payloadToSend = initializeSendPayload(payload, createAsset);      
    }
    else if(payload.Action === 1)
    {
        var createAgent = initializeAgent(payload);
        var payloadToSend = initializeSendPayload(payload, createAgent);
    }
    else if(payload.Action === 2)
    {
        var createTouch = initializeTouch(payload);
        var payloadToSend = initializeSendPayload(payload, createTouch);
    }
    else{ return; }

    return payloadToSend.serializeBinary();
}

function initializeAsset(payload){
    var createAsset = new payload_pb.CreateAssetAction();
    createAsset.setRfid(payload.RFID);
    createAsset.setSize(payload.Size);
    createAsset.setSku(payload.SkuID);
    createAsset.setLongitude(0);
    createAsset.setLatitude(0);
    return createAsset;
}


function initializeAgent(payload){
    var createAgent = new payload_pb.CreateAgentAction();
    createAgent.setName(payload.Name);
    createAgent.setPublicKey(payload.PublicKey);
    createAgent.setRole(payload.Action);
    return createAgent;
}

function initializeTouch(payload){
    var createTouch = new payload_pb.TouchAssetAction();
    console.log(payload.RFID);
    createTouch.setRfid(payload.RFID);
    createTouch.setLongitude(0);
    createTouch.setLatitude(0);
    return createTouch;
}


function initializeSendPayload(payload, create){
    var payloadToSend = new payload_pb.Payload();
    payloadToSend.setAction(payload.Action);
    payloadToSend.setTimestamp((new Date).getTime());
    if(payload.Action === 0){
        payloadToSend.setCreateAsset(create);
    }
    else if(payload.Action === 1){
        payloadToSend.setCreateAgent(create);
    }
    else if(payload.Action === 2){
        payloadToSend.setTouchAsset(create);
    }

    return payloadToSend;
}

function createBatchListBytes(signer, PublicKey, payloadBytes){
    const transactionHeader = {
        familyName: FAMILY_NAME,
        familyVersion: FAMILY_VERSION,
        inputs: [NAMESPACE_PREFIX],
        outputs: [NAMESPACE_PREFIX],
        signerPublicKey: PublicKey,
        batcherPublicKey: PublicKey,
        dependencies: [],
        payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
    };

    const transactionHeaderAsBytes = protobuf.TransactionHeader.encode(transactionHeader).finish();
    const signature = signer.sign(transactionHeaderAsBytes);

    var transaction = protobuf.Transaction.create({
        header: transactionHeaderAsBytes,
        headerSignature: signature,
        payload: payloadBytes
    });

    var transactionList = [transaction];

    var batchHeader = {
        signerPublicKey: PublicKey,
        transactionIds: transactionList.map((txn) => txn.headerSignature)
    };

    const batchHeaderBytes = protobuf.BatchHeader.encode(batchHeader).finish();
    
    const batchSignature = signer.sign(batchHeaderBytes);
    
    const batch = protobuf.Batch.create({
        header: batchHeaderBytes,
        headerSignature: batchSignature,
        transactions: transactionList
    });
 

    const batchListBytes = protobuf.BatchList.encode({
        batches: [batch]
    }).finish();
    return batchListBytes;
}

function createTransactionBytes(signer, batchSigner, payloadBytes){
    const transactionHeader = {
        familyName: FAMILY_NAME,
        familyVersion: FAMILY_VERSION,
        inputs: [NAMESPACE_PREFIX],
        outputs: [NAMESPACE_PREFIX],
        signerPublicKey: signer.getPublicKey().asHex(),
        batcherPublicKey: batchSigner.getPublicKey().asHex(),
        dependencies: [],
        payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
    };
    
    const transactionHeaderAsBytes = protobuf.TransactionHeader.encode(transactionHeader).finish();
    const signature = signer.sign(transactionHeaderAsBytes);


    var transaction = protobuf.Transaction.create({
        header: transactionHeaderAsBytes,
        headerSignature: signature,
        payload: payloadBytes
    });

    return transaction;
}

function createBatchListBytesFromMany(signer, listOfTransactions) {
    var batchHeader = {
        signerPublicKey: signer.getPublicKey().asHex(),
        transactionIds: listOfTransactions.map((txn) => txn.headerSignature)
    };

    const batchHeaderBytes = protobuf.BatchHeader.encode(batchHeader).finish();
    
    const batchSignature = signer.sign(batchHeaderBytes);
    
    const batch = protobuf.Batch.create({
        header: batchHeaderBytes,
        headerSignature: batchSignature,
        transactions: listOfTransactions
    });
 
    const batchListBytes = protobuf.BatchList.encode({
        batches: [batch]
    }).finish();

    return batchListBytes;
}

function signerFromPrivateKey(privateKey) {
    var PKGen = Secp256k1PrivateKey.Secp256k1PrivateKey.fromHex(privateKey);
    const signer = new CryptoFactory(createContext('secp256k1')).newSigner(PKGen);
    return signer;
}

module.exports = {
    createTransaction,
    createTransactionSecp,
    createTransactionBytes,
    createBatchListBytesFromMany,
    signerFromPrivateKey
}

