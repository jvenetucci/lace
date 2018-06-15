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
