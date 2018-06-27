var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'db',
    user: 'root',
    password: 'lace',
    database: 'lace',
    port: '3306'
});

connection.connect(function(err) {
    if(err) {
        console.error('ERROR CONNECTING: ' + err.stack);
        return;
    }

    console.log('CONNECTED AS ID: ' + connection.threadId);
});

function touchAsset(new_owner, rfid, timestamp, newStatus) {
    if(assetExists(rfid)) {
        console.log('ASSET DOES NOT EXIST, CANNOT TOUCH.');
        return;
    }
    connection.query('UPDATE inventory SET agent_public_key = ?, time_stamp = ?, status = ? WHERE rfid = ?', [new_owner, timestamp, newStatus, rfid], function (error, results, fields) {
        if (error) throw error;

        console.log('+++Touch successful. RFID: ' + rfid + ' now belongs to ' + new_owner);
    });
}

function addAgent(pub_key, name) {
    if(agentExists(pub_key)) {
        console.log('AGENT EXISTS');
        return;
    }
    connection.query('INSERT INTO agents (name, agent_public_key) VALUES ( ? , ? )', [name, pub_key], function (error, results, fields) {
        if (error) {
            console.log('AGENT EXISTS, DID NOT ADD'); //throw error;
        }
        else {
            console.log('+++Added agent ' + name + ':' + pub_key);
        }
    });
}

function addAsset(pub_key, rfid, sku, size, time_stamp, status) {
    if(assetExists(rfid)) {
        console.log('ASSET EXISTS, DID NOT ADD TO DB.');
        return;
    }
    connection.query('INSERT INTO inventory (agent_public_key, rfid, sku, size, time_stamp, status) VALUES ( ?, ?, ?, ?, ?, ?)', [pub_key, rfid, sku, size, time_stamp, status], function (error, results, fields) {
        if (error) {
            console.log('ASSET EXISTS, DID NOT ADD'); //throw error;
        }
        else {
            console.log('+++Added asset w/ rfid: ' + rfid);
        }
    });
}

function assetExists(rfid) {
    connection.query('SELECT EXISTS(SELECT * FROM inventory WHERE rfid = ?)', [rfid], function (error, results, fields) {
        if (error) throw error;

        for(res in results) {
            if(res == 0) {
                return false;
            }
        }
        return true;
    });
}

function agentExists(pub_key) {
    connection.query('SELECT EXISTS(SELECT * FROM agents WHERE agent_public_key = ?)', [pub_key], function (error, results, fields) {
        if (error) throw error;

        for( res in results) {
            if(res == 0) {
                for(r in results) {
                    console.log(r);
                }
                return false;
            }
        }
        return true;
    });
}

module.exports={
    addAgent,
    agentExists,
    addAsset,
    touchAsset,
    connection
}