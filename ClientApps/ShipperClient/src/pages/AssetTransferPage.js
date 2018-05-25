import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import '../styles/AssetTransferPage.css'

class AssetTransferPage extends Component {
  constructor(props) {
    super(props);
        this.state = {
            assetId: '',
            transferDate: this.getDate()
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    alert(
      "TRANSFER INFO\nAsset ID: " + this.state.assetId +
      "\nTransfer Date: " + this.state.transferDate
    );

    fetch('/shipper/touch', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        AssetId: this.state.assetId,
        TransferDate: this.state.transferDate
      })
    }).then(response => console.log(response));
    
    event.preventDefault();
  }

  getDate() {
    const date = new Date();
    var yyyy = '' + date.getFullYear();
    var mm = '' + (date.getMonth() + 1);
    var dd = '' + date.getDate();

    if (mm.length < 2) {
      mm = '0' + mm;
    }
    if (dd.length < 2) {
      dd = '0' + dd;
    }
    return [yyyy, mm, dd].join('-');
  }

  render() {
      return (
        <div className="AssetTransferPage">
          <form onSubmit={this.handleSubmit}>
            <legend>Asset Transfer Form</legend>
            <div className="form-group">
              <label>Asset ID</label>
              <input 
                type="text" 
                name="assetId"
                placeholder="Asset ID"
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
        </div>
      );
    }
}

export default AssetTransferPage