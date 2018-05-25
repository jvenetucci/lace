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

function makeAgentAddress(identifier) {
    return  NAMESPACE + 
            AGENT + 
            hash(identifier).slice(0, 63);
}

module.exports={
    makeAgentAddress,
    makeAssetAddress,
    makeHistoryAddress,
    makeTouchpointAddress
}