var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'supplychain',
    port: '3308'
});

connection.connect(function(err) {
    if(err) {
        console.error('ERROR CONNECTING: ' + err.stack);
        return;
    }

    console.log('CONNECTED AS ID: ' + connection.threadId);
});

connection.query('CREATE TABLE IF NOT EXISTS supplychain.agents (name VARCHAR(40) NOT NULL, agent_public_key VARCHAR(70) NOT NULL, PRIMARY KEY (agent_public_key));', function (error, results, fields) {
    if (error) throw error;
    
    console.log('Agent table created');
});

connection.query('CREATE TABLE IF NOT EXISTS supplychain.inventory (agent_public_key VARCHAR(70) NOT NULL, rfid VARCHAR(70) NOT NULL, sku VARCHAR(70) NOT NULL, size VARCHAR(25) NOT NULL, time_stamp VARCHAR(20) NOT NULL, PRIMARY KEY (rfid), FOREIGN KEY (agent_public_key) REFERENCES agents(agent_public_key) );', function (error, results, fields) {
    if (error) throw error;
    
    console.log('Inventory table created');
});

function getQuery(rfid, sku, size) {
    if(rfid && !sku && !size) {
        connection.query('SELECT * FROM inventory WHERE rfid = ?', [rfid], function (error, results, fields) {
            if (error) throw error;

            return results;
        });
    }
    else if(!rfid && sku && !size) {
        connection.query('SELECT * FROM inventory WHERE sku = ?', [sku], function (error, results, fields) {
            if (error) throw error;

            return results;
        });
    }
    else if(!rfid && !sku && size) {
        connection.query('SELECT * FROM inventory WHERE size = ?', [size], function (error, results, fields) {
            if (error) throw error;

            return results;
        });
    }
    else if(rfid && sku && !size) {
        connection.query('SELECT * FROM inventory WHERE rfid = ? AND sku = ?', [rfid, sku], function (error, results, fields) {
            if (error) throw error;

            return results;
        });
    }
    else if(rfid && !sku && size) {
        connection.query('SELECT * FROM inventory WHERE rfid = ? AND size = ?', [rfid, size], function (error, results, fields) {
            if (error) throw error;

            return results;
        });
    }
    else if(!rfid && sku && size) {
        connection.query('SELECT * FROM inventory WHERE sku = ? AND size = ?', [sku, size], function (error, results, fields) {
            if (error) throw error;

            return results;
        });
    }
    else if(rfid && sku && size) {
        connection.query('SELECT * FROM inventory WHERE rfid = ? AND sku = ? AND size = ?', [rfid, sku, size], function (error, results, fields) {
            if (error) throw error;

            return results;
        });
    }
}

function touchAsset(new_owner, rfid, timestamp) {
    if(assetExists(rfid)) {
        console.log('ASSET DOES NOT EXIST, CANNOT TOUCH.');
        return;
    }
    connection.query('UPDATE inventory SET agent_public_key = ?, time_stamp = ? WHERE rfid = ?', [new_owner, timestamp, rfid], function (error, results, fields) {
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

function addAsset(pub_key, rfid, sku, size, time_stamp) {
    if(assetExists(rfid)) {
        console.log('ASSET EXISTS, DID NOT ADD TO DB.');
        return;
    }
    connection.query('INSERT INTO inventory (agent_public_key, rfid, sku, size, time_stamp) VALUES ( ?, ?, ?, ?, ? )', [pub_key, rfid, sku, size, time_stamp], function (error, results, fields) {
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


// connection.end((err) => {
//     console.log('Goodbye');
// });

module.exports={
    addAgent,
    agentExists,
    addAsset,
    touchAsset
}