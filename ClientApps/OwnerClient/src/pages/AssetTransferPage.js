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

  handleSubmit(event) {
    alert(
      "Touch Asset \nAsset ID: " + this.state.rfid
    );
    var wait = ms => new Promise((r, j)=>setTimeout(r, ms));
  fetch('/api/touch/Company', {
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
    reader.read().then((({done, value}) => {
      //decode and parse into JSON
      var obj = new TextDecoder("utf-8").decode(value);
      let jsonObj = JSON.parse(obj);

      //Status code
      var touchStatus = jsonObj.data[0].status;
      //Link to get the real status code if this status code is pending (it is).
      var statusLink = jsonObj.link;
      //alert(touchStatus);

      //If we somehow got a non-pending result
      if(touchStatus !== 'PENDING') {
        //This will never happen.
        alert('It went through?');
      } else {
        //This is necessary. The function executes so quickly that the status is still pending,
        //and looping just gives my computer... problems.
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

          //What kind of sadist has an unparsed JSON inside of a JSON?
          touchStatus = JSON.parse(jsoncheckedStatusResponse.body).data[0].status;

          //alert('touchStatus:\n\n' + touchStatus.data[0].status);

          document.getElementById('status').innerHTML = touchStatus;

          }))
        });

        event.preventDefault();
      }

    }))
  });
    event.preventDefault();
  }

  /* Format of JSON returned by the touch action
  {
    "data": [
      {
        "id": "c184b997160fb8c92a59eb92d0e7d598b2cc9932a90b59307b1fed1e4681addc0064475b97c39f254a19a371a593561fb0ceb36783374e02b48550df27a0957e",
        "invalid_transactions": [],
        "status": "PENDING"
      }
    ],
    "link": "http://localhost:8008/batch_statuses?id=c184b997160fb8c92a59eb92d0e7d598b2cc9932a90b59307b1fed1e4681addc0064475b97c39f254a19a371a593561fb0ceb36783374e02b48550df27a0957e"
  }
  */

  /*
  * This godawful hack comes from the author of this article:
  * https://www.sitepoint.com/delay-sleep-pause-wait/
  * I hope he feels as dirty about writing it as I do about using it.
  */
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