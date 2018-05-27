import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/LoginPage.css'
import { login } from '../utils/xhr'
const queryBlockChain = require('../utils/queryBlockChainForState.js');

var RFIDBox = '';
var hist = '';

function addTableHead(itemHistory) {
  var tableRef = document.getElementById('histTable');
  tableRef.deleteTHead();
  tableRef.deleteCaption();
  
  var tableCaption = tableRef.createCaption();
  tableCaption.align = 'left';
  var captionText = document.createTextNode(itemHistory.ProductName);
  tableCaption.appendChild(captionText);


  var tableHead = tableRef.createTHead();
  var newHeadRow = tableHead.insertRow(-1);
  var newHeadCell = newHeadRow.insertCell(-1);
  var cellText = document.createTextNode("Holder");
  newHeadCell.appendChild(cellText);
  var newHeadCell = newHeadRow.insertCell(-1);
  var cellText = document.createTextNode('Latitude');
  newHeadCell.appendChild(cellText);
  var newHeadCell = newHeadRow.insertCell(-1);
  var cellText = document.createTextNode('Longitude');
  newHeadCell.appendChild(cellText);
}

function addTableRows(itemHistory) {
  var tableRef = document.getElementById('histTable');

  itemHistory.History.forEach(element => {
  var newRow = tableRef.insertRow(-1);
  var newCell = newRow.insertCell(-1);
  var cellText = document.createTextNode(element.Owner);
  newCell.appendChild(cellText);
  var newCell = newRow.insertCell(-1);
  var cellText = document.createTextNode(element.Lat);
  newCell.appendChild(cellText);
  var newCell = newRow.insertCell(-1);
  var cellText = document.createTextNode(element.Long);
  newCell.appendChild(cellText);
  });

}

function updateBox() {
  var temp = document.getElementById('rfid');

  if(temp !== null) {
    RFIDBox = temp.value;
  }
}

const ViewHistory = ({ history }) => (
  <div className="ViewHistory">
    <h1>Enter the RFID of an item to view its history</h1>
    <br/>
    <div className="RFID-history-form">
              <label>RFID</label>
              <input 
                type="text" 
                name="rfid"
                id="rfid"
                placeholder="RFID"
                onChange={updateBox()} 
                required
              />
    </div>
    <br/>
    <button onClick={() => {
      updateBox();
      if(RFIDBox.toString() != '') {
        hist = queryBlockChain.fakeHistoryReport(RFIDBox);
        addTableHead(hist);
        addTableRows(hist);
      }
    }}>View History</button>
    <div className="TableDescriptor" id="tabDesc"/>
    <div className="HistoryTable">
      <table id="histTable">
        <tbody></tbody>
      </table>
    </div>
  </div>
)

export default ViewHistory
