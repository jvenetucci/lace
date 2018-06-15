Backend server that communicates to both the client pages and validator


Transactions are created using the information from the client apps.
The transactions are then sent to the validator using a HTTP post request.
The response from the HTTP request is then sent to corresponding client app
with the necessary information