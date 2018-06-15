/* Team B is comprised of the following individuals:
    - Roberto Avila
    - Andrew Burnett
    - Jeff De La Mare
    - Nick Nation
    - Phillip Nguyen
    - Anthony Tran
    - Joseph Venetucci

[This program is licensed under the "MIT License"]
Please see the file LICENSE.md in the 
source distribution of this software for license terms.

This software also makes use of Hyperledger Sawtooth which is
licensed under Apache 2.0. A copy of it's license and copyright
are contained in sawtooth-license.md and sawtooth-copyright.md */


const {createHash} = require('crypto');
const {protobuf} = require('sawtooth-sdk');
const cbor = require('cbor');

//This is all account stuff, not for this file in the long run, but it's here for now because there is nowhere else.
const {createContext, CryptoFactory} = require(sawtooth-sdk/signing);
const context = createContext('secp256k1');
const privateKey = context.newRandomPrivateKey();
const signer = CryptoFactory(context).newSigner(privateKey);
//End account stuff that doesn't belong here.

//Placeholder value for input and output, discussed below where used.
const placeholderInputOutput = '19d832';


//Function creates a transaction 
//Input: String for: 0) Kind of action that you are doing 1) shoe type 2) shoe size 3) sku 4) RFID#
//Output: A single transaction object ready to be batched and sent. 
function createTransaction(action, productType, size, sku, rfid, date) {

    //payload is the data of the shoe, add more fields as desired, it doesn't affect anything else.
    const payload = (action, productType, size, sku, rfid, date) => {
        return {
            Action: action,
            ProductType: productType,
            Size: size,
            SKU: sku,
            RFID: rfid,
            Date: date
        };
    };

    //Encode the payload as bytes
    const payloadBytes = cbor.encode(payload);

    //Create the transaction header
    const transactionHeaderBytes = protobuf.TransactionHeader.encode({
        familyName: 'intkey',
        familyVersion: '1.0',

        /*
        Inputs and outputs are the state addresses a transaction is allowed to read from or write to.
        The documentation says that this information is up to the transaction processor, so we may
        not have anything valid at this time for inputs or outputs. 
        The tuna demo uses the string "19d832", which I've put here as a placeholder, the alternative is
        an empty field like with dependencies below.
        */
        inputs: [placeholderInputOutput],
        outputs: [placeholderInputOutput],

        //Add public key. Need to modify when we've added account stuff so that this uses the correct account's key.
        signerPublicKey: signer.getPublicKey().asHex(),
        batcherPublicKey: signer.getPublicKey().asHex(),

        //This is supposed to be the previous transaction header, but we don't have any of that, 
        dependencies: [],

        //Hash the payload to symbolically link the header and payload. 
        payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
    }).finish();

    //Sign the header with key.
    const signedHeader = signer.sign(transactionHeaderBytes);

    //Create the transaction
    const transaction = protobuf.Transaction.create({
        header: transactionHeaderBytes,
        headerSignature: signedHeader,
        payload: payloadBytes
    });

    return transaction;

   const transactions = [transaction];

   const batchHeaderBytes = protobuf.BatchHeader.encode({
       signerPublicKey: signer.getPublicKey.asHex(),
       transactionIds: transactions.map((txn) => txn.headerSignature),
   }).finish();

   const batchSignature = signer.sign(batchHeaderBytes);
   
   const batch = protobuf.Batch.create({
       header: batchHeaderBytes,
       headerSignature: batchSignature,
       transactions: transactions
   });

   const batchListBytes = protobuf.BatchList.encode({
       batches: [batch]
   }).finish();

   return batchListBytes;
   
};



Module.exports = {
    createTransaction
}







