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


import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import '../styles/AssetTransferPage.css'

class AssetTransferPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rfid: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  // Do this when the submit button is clicked.
  handleSubmit(event) {
    var wait = ms => new Promise((r, j) => setTimeout(r, ms));

    //Send the RFID from the box to the app's backend (not the blockchain)
    fetch('/api/touch/Factory', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rfid: this.state.rfid,
      })
    })
      .then(response => {
        //Need to extract the data from the response
        const reader = response.body.getReader();
        reader.read().then((({ done, value }) => {
          //decode and parse into JSON
          var obj = new TextDecoder("utf-8").decode(value);
          let jsonObj = JSON.parse(obj);

          //Status code
          var touchStatus = jsonObj.data[0].status;
          //Link to get the real status code if this status code is pending (it is).
          var statusLink = jsonObj.link;

          //If we somehow got a non-pending result
          if (touchStatus !== 'PENDING') {
            document.getElementById('status').innerHTML = touchStatus;
          } else {
            //The addition of &wait=true to the addressing in the app's backend we ensure that we won't reach this else clause ever.
            //However trusting computers is usually a dumb idea so I've left it in just in case some SNAFU occurs.
            this.sleep(250);
            //Check the returned url to find out the status of our transaction
            fetch('/api/status/Factory', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: statusLink,
              })
            })
              .then(response => {
                //Read the response
                const statusCodeReader = response.body.getReader();
                statusCodeReader.read().then((({ done, value }) => {

                  //decode and parse into JSON
                  var checkedStatusResponse = new TextDecoder("utf-8").decode(value);
                  var jsoncheckedStatusResponse = JSON.parse(checkedStatusResponse);

                  //What kind of sadist has an unparsed JSON inside of a JSON?
                  touchStatus = JSON.parse(jsoncheckedStatusResponse.body).data[0].status;

                  document.getElementById('status').innerHTML = touchStatus;
                }))
              });

            event.preventDefault();
          }

        }))
      });
    event.preventDefault();
  }


  //This function is needed for the else code above. Without the ability to wait you cannot gaurantee that the backend will have actually updated when you send the second request.
  sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds) {
        break;
      }
    }
  }

  render() {
    return (
      <div className="AssetTransferPage">
        <form onSubmit={this.handleSubmit}>
          <legend>Asset Transfer Form</legend>
          <div className="form-group">
            <label>RFID</label>
            <input
              type="text"
              name="rfid"
              placeholder="RFID"
              onChange={this.handleChange}
              required
            />
          </div>

          <div className="btn-submit">
            <input type="submit" value="Submit" />
          </div>
        </form>
        <div>
        </div>
        <div>
        </div>
        <div className="statusCode" id="statusCode">
          <p id="status"></p>
        </div>
      </div>

    );
  }
}

export default AssetTransferPage