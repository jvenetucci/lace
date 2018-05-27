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

  addTableHead(rfidTag) {
    var tableRef = document.getElementById('histTable');
    tableRef.deleteTHead();
    tableRef.deleteCaption();
    
    var tableCaption = tableRef.createCaption();
    tableCaption.align = 'left';
    var captionText = document.createTextNode('History of ' + rfidTag);
    tableCaption.appendChild(captionText);
  
  
    var tableHead = tableRef.createTHead();
    var newHeadRow = tableHead.insertRow(-1);
    var newHeadCell = newHeadRow.insertCell(-1);
    var cellText = document.createTextNode("Holder");
    newHeadCell.appendChild(cellText);
  }
  
  addTableRows(itemHistory) {
    var tableRef = document.getElementById('histTable');
  
    itemHistory.forEach(element => {
    var newRow = tableRef.insertRow(-1);
    var newCell = newRow.insertCell(-1);

    var cellText = document.createTextNode(this.resolvePubKeyToName(element.publicKey));
    newCell.appendChild(cellText);
    });
  
  }

  resolvePubKeyToName(keyToResolve) {

    if('026d529e3955f7cde5f89dec9dc1defeeffe462765a183c411cafa32406eb2a990' === keyToResolve) {
      return 'ShipperBoat';
    } else if('031498a3d386e2ff9c6e6eca56f48f8d796248aa3135c9f88e5d7f871bfa12a7ca' === keyToResolve) {
      return 'Shipper';
    } else if('020b0132a725e8fe6a6ee74a902cfc3f0bcbb7ae7b5d2218aad18b16df422a0f5d' === keyToResolve) {
      return 'Company';
    } else if('02bc83bb8d3f5e99ab4cde7bb576ecb6898683261cc044349c15b7076261555f68' === keyToResolve) {
      return 'Factory';
    } else {
      return 'ShipperTruck2';
    }
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
      alert(obj);

      //Extract relevant info.
      var rfid = jsonObj.entriesList[0].rfid;
      var reporterList = jsonObj.entriesList[0].reporterListList;
      alert('rfid: ' + rfid + '\nreporter list:' + reporterList);
      this.addTableHead(rfid);
      this.addTableRows(reporterList);
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