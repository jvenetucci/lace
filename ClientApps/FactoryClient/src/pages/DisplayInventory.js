import React, { Component } from 'react';
import '../css/DisplayInventory.css';
import ReactDOM from 'react-dom';
const queryBlockChain = require('../utils/queryBlockChainForState.js');

var items = [{
    ProductType: "Cool Shoe",
    Size: "12",
    SKU: "SKU123",
    RFID: "12345",
    Date: "5769849300"
}]; 

class TableRow extends React.Component {
  render() {
    const {
      data
    } = this.props;
    const row = data.map((data) =>
    <tr>
      <td key={data.ProductType}>{data.ProductType}</td>
      <td key={data.Size}>{data.Size}</td>
      <td key={data.SKU}>{data.SKU}</td>
      <td key={data.RFID}>{data.RFID}</td>
      <td key={data.Date}>{data.Date}</td>
    </tr>
    );
    return (
      <span>
          <legend>Assets</legend>
          <thead>
              <th>Product</th>
              <th>Size</th>
              <th>SKU</th>
              <th>RFID</th>
              <th>Date</th>
          </thead>
            {row}
      </span>
    );
  }
}

class Table extends React.Component {
  
  render() {
    items = queryBlockChain.queryBlockChainForState();
    return (
      <table>
        <TableRow data={items} />
      </table>
    );
  }
}



ReactDOM.render(<Table data={items} />, document.getElementById("root"));

export default Table;