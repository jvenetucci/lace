import React, { Component } from 'react'
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
    var tableRef = document.getElementById('itemTable');
    tableRef.deleteTHead();
    tableRef.deleteCaption();
    
    var tableCaption = tableRef.createCaption();
    tableCaption.align = 'left';
    var captionText = document.createTextNode('History of :');
    tableCaption.appendChild(captionText);
    var tableHead = tableRef.createTHead();
    var newHeadRow = tableHead.insertRow(-1);
    var newHeadCell = newHeadRow.insertCell(-1);
    var cellText = document.createTextNode("RFID");
    newHeadCell.appendChild(cellText);
    newHeadCell = newHeadRow.insertCell(-1);
    cellText = document.createTextNode("Size");
    newHeadCell.appendChild(cellText);
    newHeadCell = newHeadRow.insertCell(-1);
    cellText = document.createTextNode("SKU");
    newHeadCell.appendChild(cellText);

  
    tableRef = document.getElementById('histTable');
    tableRef.deleteTHead();
    tableRef.deleteCaption();

    tableHead = tableRef.createTHead();
    newHeadRow = tableHead.insertRow(-1);
    newHeadCell = newHeadRow.insertCell(-1);
    cellText = document.createTextNode("Holder");
    newHeadCell.appendChild(cellText);
    newHeadCell = newHeadRow.insertCell(-1);
    cellText = document.createTextNode("Timestamp");
    newHeadCell.appendChild(cellText);
  }
  
  addTableRows(itemHistory, elementId) {
    var tableRef = document.getElementById(elementId);

    
  
    for (var i = 1; i < itemHistory.length; i++) {
      var newRow = tableRef.insertRow(-1);
      var newCell = newRow.insertCell(-1);
      var cellText = document.createTextNode(itemHistory[i].name);
      newCell.appendChild(cellText);
      var newCell2 = newRow.insertCell(-1);
      var date = new Date(itemHistory[i].timestamp);
      var cellText2 = document.createTextNode(date.toLocaleString());
      newCell2.appendChild(cellText2);
    }
  }
  
  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    document.getElementById('statusCode').innerHTML = '';
    let infoTable = document.getElementById('itemTable');

    //clear the table.
    if(infoTable.rows.length !== 0){
      infoTable.deleteTHead();
      infoTable.deleteCaption();
      infoTable.deleteRow(-1);
    }

    var tableRef = document.getElementById('histTable');

    if(tableRef.rows.length !== 0) {
      tableRef.deleteTHead();
      tableRef.deleteCaption();
      while(tableRef.rows.length > 0) {
        tableRef.deleteRow(-1);
      } 
    }

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

      //Extract the product info stored in the final array element
      let jsonObj = JSON.parse(obj);

      if(jsonObj[0] === undefined || jsonObj[0] === '') {
        document.getElementById('statusCode').innerHTML = 'Error: RFID not found.';
        return;
      }

      let info = jsonObj.pop();
      

      //clear the table.
      if(infoTable.rows.length !== 0){
        infoTable.deleteTHead();
        infoTable.deleteCaption();
        infoTable.deleteRow(-1);
      }

      var newRow = infoTable.insertRow(-1);
      var newCell = newRow.insertCell(-1);
      var cellText = document.createTextNode(info.entriesList[0].rfid);
      newCell.appendChild(cellText);
      newCell = newRow.insertCell(-1);
      cellText = document.createTextNode(info.entriesList[0].size);
      newCell.appendChild(cellText);
      newCell = newRow.insertCell(-1);
      cellText = document.createTextNode(info.entriesList[0].sku);
      newCell.appendChild(cellText);

      this.addTableHead(jsonObj[0].rfid);
      this.addTableRows(jsonObj, 'histTable');

      
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
            <div className="AttributeTable">
              <table id="itemTable">
                <tbody></tbody>
              </table>
            </div>
            <br/>
            <div className="TableDescriptor" id="tabDesc"/>
            <div className="HistoryTable">
              <table id="histTable">
                <tbody></tbody>
              </table>
            </div>
            <div className="statusCode" id="statusCode">
            <p id="status"></p>
          </div>
        </div>
      );
    }
}

export default AssetHistoryPage