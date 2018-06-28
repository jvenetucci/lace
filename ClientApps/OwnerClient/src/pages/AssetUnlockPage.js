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
import 'react-router-dom'
import '../styles/AssetTransferPage.css'

class AssetUnlockPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rfid: '',
            user: '',
        }
        this.handleRFIDChange = this.handleRFIDChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleUserChange(event) {
        var state = this.state;
        state.user = event.target.value;
        this.setState(state);
    }

    handleRFIDChange(event) {
        var state = this.state;
        state.rfid = event.target.value;
        this.setState(state);
    }

  handleSubmit(event) {
  event.preventDefault();
  fetch('/api/unlock', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rfid: this.state.rfid,
      user: this.state.user
    })
  })
  .then(response => {
    //Need to extract the data from the response
    const reader = response.body.getReader();
    reader.read().then((({done, value}) => {
      
      //decode and parse into JSON
      var obj = new TextDecoder("utf-8").decode(value);
      let jsonObj = JSON.parse(obj);

      //Status code
      var touchStatus = jsonObj.data[0].status;
      //Link to get the real status code if this status code is pending (it is).
      var statusLink = jsonObj.link;

      //If we somehow got a non-pending result
      if(touchStatus !== 'PENDING') {
        document.getElementById('status').innerHTML = touchStatus;
      } else {
        this.sleep(250);
        //Check the returned url to find out the status of our transaction
        fetch('/api/status/Company', {
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
          statusCodeReader.read().then((({done, value}) => {

          //decode and parse into JSON
          var checkedStatusResponse = new TextDecoder("utf-8").decode(value);
          var jsoncheckedStatusResponse = JSON.parse(checkedStatusResponse);
          touchStatus = JSON.parse(jsoncheckedStatusResponse.body).data[0].status;

          document.getElementById('status').innerHTML = touchStatus;
          }))
        })
      }
    }))
  })
}

          // fetch('/api/touchLock', {
          //   method: 'POST',
          //   headers: {
          //     'Accept': 'application/json',
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify({
          //     userPubKey: this.state.user,
          //     rfid: this.state.rfid,
          //   })
          // })
          // .then(response => {
          //   //Need to extract the data from the response
          //   const reader = response.body.getReader();
          //   reader.read().then((({done, value}) => {
          //   //decode and parse into JSON
          //   var obj = new TextDecoder("utf-8").decode(value);
          //   let jsonObj = JSON.parse(obj);

          //   //Status code
          //   var touchStatus = jsonObj.data[0].status;
          //   //Link to get the real status code if this status code is pending (it is).
          //   var statusLink = jsonObj.link;

          //   //If we somehow got a non-pending result
          //   if(touchStatus !== 'PENDING') {
          //       document.getElementById('status').innerHTML = touchStatus;
          //   } else {
          //       this.sleep(250);
          //       //Check the returned url to find out the status of our transaction
          //       fetch('/api/status/Company', {
          //       method: 'POST',
          //       headers: {
          //           'Accept': 'application/json',
          //           'Content-Type': 'application/json',
          //       },
          //       body: JSON.stringify({
          //           url: statusLink,
          //       })
          //       })
          //       .then(response => {
          //       //Read the response
          //       const statusCodeReader = response.body.getReader();
          //       statusCodeReader.read().then((({done, value}) => {

          //       //decode and parse into JSON
          //       var checkedStatusResponse = new TextDecoder("utf-8").decode(value);
          //       var jsoncheckedStatusResponse = JSON.parse(checkedStatusResponse);
          //       touchStatus = JSON.parse(jsoncheckedStatusResponse.body).data[0].status;

          //       document.getElementById('status').innerHTML = touchStatus;
                    // }))
                    // });
//       }

//     }))
//   });
//   }));
// });
//       }
      // }));
    // })}

  sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

  render() {
      return (
        <div className="AssetUnlockPage">
          <form onSubmit={this.handleSubmit}>
            <legend>Asset Unlock Form</legend>
            <div className="form-group">
              <label>RFID</label>
              <input 
                type="text" 
                name="rfid"
                placeholder="RFID"
                onChange={this.handleRFIDChange} 
                required
              />
              <br/>
              <label>Transfer To</label>
              <input 
                type="text" 
                name="transfer"
                placeholder="User ID"
                onChange={this.handleUserChange} 
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

export default AssetUnlockPage
