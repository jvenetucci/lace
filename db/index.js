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

connection.query('SELECT * FROM inventory', function (error, results, fields) {
    if (error) throw error;
    
    console.log('The solution is: ', results);
    console.log('Number of results: ' + results.length);
});

connection.end((err) => {
    console.log('Goodbye');
});