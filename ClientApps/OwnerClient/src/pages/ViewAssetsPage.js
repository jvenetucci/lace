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
import '../styles/AssetHistory.css'

class ViewAssetsPage extends Component {
  constructor(props) {
    super(props);
        this.state = {
            sku: '',
            size: '',
        }
        this.handleSkuChange = this.handleSkuChange.bind(this);
        this.handleSizeChange = this.handleSizeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
  }

  addTableHead() {
    var tableRef = document.getElementById('histTable');
    tableRef.deleteTHead();
    tableRef.deleteCaption();
    
    var tableCaption = tableRef.createCaption();
    tableCaption.align = 'left';
    var captionText = document.createTextNode('Assets:');
    tableCaption.appendChild(captionText);
    var tableHead = tableRef.createTHead();
    var newHeadRow = tableHead.insertRow(-1);
    var newHeadCell = newHeadRow.insertCell(-1);
    var cellText = document.createTextNode("Holder");
    newHeadCell.appendChild(cellText);
    newHeadCell = newHeadRow.insertCell(-1);
    cellText = document.createTextNode("RFID");
    newHeadCell.appendChild(cellText);
    newHeadCell = newHeadRow.insertCell(-1);
    cellText = document.createTextNode("SKU");
    newHeadCell.appendChild(cellText);
    newHeadCell = newHeadRow.insertCell(-1);
    cellText = document.createTextNode("Size");
    newHeadCell.appendChild(cellText);
    newHeadCell = newHeadRow.insertCell(-1);
    cellText = document.createTextNode("Status");
    newHeadCell.appendChild(cellText);
    newHeadCell = newHeadRow.insertCell(-1);
    cellText = document.createTextNode("Timestamp");
    newHeadCell.appendChild(cellText);
  }
  
  addTableRows(assets, elementId) {
    var tableRef = document.getElementById(elementId);
  
    for (var i = 0; i < assets.length; i++) {
      var newRow = tableRef.insertRow(-1);
      var newCell = newRow.insertCell(-1);
      var cellText = document.createTextNode(assets[i].agent_public_key);
      newCell.appendChild(cellText);

      var new2Cell = newRow.insertCell(-1);
      var cell2Text = document.createTextNode(assets[i].rfid);
      new2Cell.appendChild(cell2Text);

      var new3Cell = newRow.insertCell(-1);
      var cell3Text = document.createTextNode(assets[i].sku);
      new3Cell.appendChild(cell3Text);

      var new4Cell = newRow.insertCell(-1);
      var cell4Text = document.createTextNode(assets[i].size);
      new4Cell.appendChild(cell4Text);

      var new5Cell = newRow.insertCell(-1);
      var cell5Text = document.createTextNode(assets[i].status);
      new5Cell.appendChild(cell5Text);

      var new6Cell = newRow.insertCell(-1);
      var date = new Date(parseInt(assets[i].time_stamp, 10));
      var cell6Text = document.createTextNode(date.toLocaleString());
      new6Cell.appendChild(cell6Text);
    }
  }
  
  handleSkuChange(event) {
    var state = this.state;
    state.sku = event.target.value;
    this.setState(state);
  }

  handleSizeChange(event) {
    var state = this.state;
    state.size = event.target.value;
    this.setState(state);
  }

  handleSubmit(event) {
    document.getElementById('statusCode').innerHTML = '';

    var tableRef = document.getElementById('histTable');

    if(tableRef.rows.length !== 0) {
      tableRef.deleteTHead();
      tableRef.deleteCaption();
      while(tableRef.rows.length > 0) {
        tableRef.deleteRow(-1);
      } 
    }

    var url = '/api/query?';

    if (this.state.sku !== '') {
      url += 'sku=' + this.state.sku
      if (this.state.size !== '') {
        url += '&size=' + this.state.size
      }
    } else if (this.state.size !== '') {
      url += 'size=' + this.state.size
    }


  fetch(url).then(response => {
    //Need to extract the data from the response
    
    const reader = response.body.getReader();
    reader.read().then((({done, value}) => {
      //decode and parse into JSON
      var obj = new TextDecoder("utf-8").decode(value);

      //Extract the product info stored in the final array element
      let jsonObj = JSON.parse(obj);
      console.log(jsonObj);
    
    if(jsonObj.length === 0 ) {
      document.getElementById('statusCode').innerHTML = 'No Assets Found.';
      return;
    }

    this.addTableHead();
    this.addTableRows(jsonObj, 'histTable');
      
    }))
  });
    event.preventDefault();
  }

  render() {
      return (
        <div className="ViewAssetsPage">
          <form onSubmit={this.handleSubmit}>
            <legend>View Assets Form</legend>
            <div className="form-group">
              <label>SKU</label>
              <input 
                type="text" 
                name="sku"
                placeholder="SKU"
                onChange={this.handleSkuChange} 
              />
            </div>

            <div className="form-group">
              <label>Size</label>
              <input 
                type="text" 
                name="size"
                placeholder="Size"
                onChange={this.handleSizeChange} 
              />
            </div>
            
            <div className="btn-submit">
              <input type="submit" value="Submit" />
            </div>
          </form>
          <div>
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

export default ViewAssetsPage