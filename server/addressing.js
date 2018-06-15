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


var crypto = require('crypto');

const FAMILY_NAME = 'lace';
const NAMESPACE = hash(FAMILY_NAME).slice(0, 6);
const ASSET = '0';
const HISTORY = '1';
const AGENT = '2';

function hash(string) {
    return crypto.createHash('sha512').update(string).digest("hex");
}

function makeTouchpointPostfix(num) {
    return num.toString(16).padStart(4, "0");
}

function makeAssetAddress(identifier) {
    return  NAMESPACE + 
            ASSET + 
            hash(identifier).slice(0, 59) + 
            '0000';
}

function makeHistoryAddress(identifier) {
    return  NAMESPACE + 
            HISTORY + 
            hash(identifier).slice(0, 59) + 
            '0000';
}

function makeTouchpointAddress(identifier, index) {
    return  NAMESPACE + 
            HISTORY + 
            hash(identifier).slice(0, 59) + 
            makeTouchpointPostfix(index);
}

function makeAllHistoryAddress(identifier) {
    return NAMESPACE + 
            HISTORY + 
            hash(identifier).slice(0, 59);
}

function makeAgentAddress(identifier) {
    return  NAMESPACE + 
            AGENT + 
            hash(identifier).slice(0, 63);
}

module.exports={
    makeAgentAddress,
    makeAssetAddress,
    makeHistoryAddress,
    makeAllHistoryAddress,
    makeTouchpointAddress
}