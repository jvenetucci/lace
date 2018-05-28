// to run npm run dev
//import express
const express = require('express');
var bodyParser = require('body-parser');

// call express
const app = express();

// used for parsing information from websites
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// get routes from file and use route
var routes = require('./routes/index');
app.use('/', routes);

if (process.env.PORT) {
    app.set('port', process.env.PORT);
} else {
    app.set('port', 5001);
}

var server = app.listen(app.get('port'), function(){
    console.log("app started on port:", app.get('port'));
})
