import React, { Component } from 'react';
import './styles/Form.css';

class TransferForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            assetId: '',
            currentHolderId: '',
            receiverId: '',
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
        "Transfer Info\nAsset ID: " + this.state.assetId +
        "\nCurrent holder ID: " + this.state.currentHolderId +
        "\nReceiver ID: " + this.state.receiverId +
        "\nTransfer Date: " + this.state.transferDate
      );
      
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
          <div className="TransferForm">
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
              <div className="form-group">
                <label>Current Holder ID</label>
                <input 
                  type="text" 
                  name="currentHolderId"
                  placeholder="Current Holder ID"
                  onChange={this.handleChange} 
                  required
                />
              </div>
              <div className="form-group">
                <label>Receiver ID</label>
                <input 
                  type="text" 
                  name="receiverId"
                  placeholder="Receiver ID"
                  onChange={this.handleChange} 
                  required
                />
              </div>
              <div className="btn-submit">
                <input type="submit" value="Submit" />
              </div>
            </form>
          </div>
        );
      }
}

export default TransferForm;