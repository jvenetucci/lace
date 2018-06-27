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

module.exports={
    connection
}