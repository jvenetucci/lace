import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import '../styles/AssetHistory.css'

class AssetHistoryPage extends Component {
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
      "History\nRFID: " + this.state.rfid
    );

  fetch('/api/history/Company', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      RFID: this.state.rfid,
    })
  })
  .then(response => {
    //Need to extract the data from the response
    const reader = response.body.getReader();
    reader.read().then((({done, value}) => {
      //decode and parse into JSON
      var obj = new TextDecoder("utf-8").decode(value);
      let jsonObj = JSON.parse(obj);

      //Reference for names of JSON fields.
      //alert(obj);

      //Extract relevant info.
      var rfid = jsonObj.entriesList[0].rfid;
      var reporterList = jsonObj.entriesList[0].reporterListList;
      alert('rfid: ' + rfid + '\nreporter list:' + reporterList);
    }))
  });
    event.preventDefault();

  }

  render() {
      return (
        <div className="AssetHistoryPage">
          <form onSubmit={this.handleSubmit}>
            <legend>Display History Form</legend>
            <div className="form-group">
              <label>RFRID</label>
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
          <div className="TableDescriptor" id="tabDesc"/>
            <div className="HistoryTable">
              <table id="histTable">
                <tbody></tbody>
              </table>
            </div>
        </div>
      );
    }
}

export default AssetHistoryPage