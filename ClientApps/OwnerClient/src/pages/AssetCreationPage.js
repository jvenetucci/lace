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
import '../styles/AssetCreationPage.css'

class AssetCreationPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rfid: '',
            sku: '',
            size: '',
            showSizeMenu: false
        }
        this.showSizeMenu = this.showSizeMenu.bind(this);
        this.closeSizeMenu = this.closeSizeMenu.bind(this);
        this.setSize = this.setSize.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    showSizeMenu(event) {
      event.preventDefault();

      this.setState({ showSizeMenu: true }, () => {
        document.addEventListener('click', this.closeSizeMenu);
      });
    }

    closeSizeMenu() {
      this.setState({ showSizeMenu: false }, () => {
        document.removeEventListener('click', this.closeSizeMenu);
      });
    }

    setSize(event) {
      event.preventDefault();
      this.setState({ size: event.target.id });
    }

    handleChange(event) {
      this.setState({ [event.target.name]: event.target.value });
    }


    randomRFID(){
      var result = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 16; i++){
        result += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return result;
    }

    randomNumber(length, min, max){
      var result = "";
      for(var i = 0; i < length; i++){
        result += Math.floor(Math.random() * (Math.floor(max) - Math.floor(min)) + min);
      }
      return result;
    }

    scan = (event) =>{
      event.preventDefault();
      var rfidID = this.randomRFID();
      var skuID = this.randomNumber(8, 0, 10);
      var shoeSize = this.randomNumber(1, 7, 14.5);
      this.setState({rfid : rfidID});
      this.setState({sku : skuID});
      this.setState({size : shoeSize});
      if(this.randomNumber(1,0,2) === '1'){
        this.setState({size : (parseInt(shoeSize, 10) + .5).toString()});
      }
      document.getElementById("rfid").value = rfidID;
      document.getElementById("sku").value = skuID;
      this.closeSizeMenu();
    }

    handleSubmit (event){
      fetch('/api/send/Company', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          size: this.state.size,
          sku: this.state.sku,
          rfid: this.state.rfid,
        })
      }).then(function(response){
        return response.json().then(body => body)
      })
      .then(function(response) {
        var responseBody = response.data[0];
        if(response.data[0].invalid_transactions[0] !== undefined){
          document.getElementById("invalid-transaction").innerHTML = "Invalid transactions: " + responseBody.invalid_transactions[0].message;
        }
        else{
          document.getElementById("invalid-transaction").innerHTML = "Invalid transactions: None"; 
        }
        document.getElementById("transaction-status").innerHTML = "Status: " + responseBody.status;
      });
      event.preventDefault();
    }

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
          <div className="AssetCreationPage">
            <form onSubmit={this.handleSubmit}>
              <legend>Asset Creation Form</legend>
              <div className="form-group">
                <label>RFID</label>
                <input
                  id="rfid" 
                  type="text" 
                  name="rfid"
                  placeholder="RFID"
                  onChange={this.handleChange} 
                  required
                />
              </div>
              <div className="form-group">
                <label>SKU:&emsp;</label>
                <input 
                  id="sku" 
                  type="text" 
                  name="sku"
                  placeholder="SKU"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="row">
                  <div className="form-group">
                    <div>
                    <label>Size</label>
                    <div className="size-btn" onClick={this.showSizeMenu} id="Size-selection">
                      > {this.state.size}
                      </div>
                    {
                      this.state.showSizeMenu
                      ? (
                        <div className="dropdown-menu">
                          <div className="dropdown-cell size-t-l" id="7" onClick={this.setSize}> 7 </div>
                          <div className="dropdown-cell" id="7.5" onClick={this.setSize}> 7.5 </div>
                          <div className="dropdown-cell" id="8" onClick={this.setSize}> 8 </div>
                          <div className="dropdown-cell" id="8.5" onClick={this.setSize}> 8.5 </div>
                          <div className="dropdown-cell size-t-r" id="9" onClick={this.setSize}> 9 </div>
                          <div className="dropdown-cell" id="9.5" onClick={this.setSize}> 9.5 </div>
                          <div className="dropdown-cell" id="10" onClick={this.setSize}> 10 </div>
                          <div className="dropdown-cell" id="10.5" onClick={this.setSize}> 10.5 </div>
                          <div className="dropdown-cell" id="11" onClick={this.setSize}> 11 </div>
                          <div className="dropdown-cell" id="11.5" onClick={this.setSize}> 11.5 </div>
                          <div className="dropdown-cell size-b-l" id="12" onClick={this.setSize}> 12 </div>
                          <div className="dropdown-cell" id="12.5" onClick={this.setSize}> 12.5 </div>
                          <div className="dropdown-cell" id="13" onClick={this.setSize}> 13 </div>
                          <div className="dropdown-cell" id="13.5" onClick={this.setSize}> 13.5 </div>
                          <div className="dropdown-cell no-hover size-b-r" id="0"> </div>
                        </div>
                      ) : ( null )
                    }
                  </div>
                </div>
              </div>
              <div className="btn-submit">
                <input type="submit" value="Submit" />
              </div>
            </form>
            <div className="btn-attribute">
              <input type="submit" value="Scan" onClick={this.scan}/>
            </div>
            <br></br>
            <p3 className="text" id="invalid-transaction"><font size="6"></font></p3>
            <br></br>
            <p3 className="text" id="transaction-status"><font size="6"></font></p3>
            <br></br>
          </div>
        );
      }
}

export default AssetCreationPage;
