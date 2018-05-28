import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import '../styles/AssetCreationPage.css'
import { EWOULDBLOCK } from 'constants';

class AssetCreationPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rfid: '',
            sku: '',
            size: '',
            showSizeMenu: false
        }
        this.URL = '';
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
      this.state.rfid = this.randomRFID();
      this.state.sku = this.randomNumber(8, 0, 10);
      this.state.size = this.randomNumber(1, 7, 14.5);
      if(this.randomNumber(1,0,2) == 1){
        var num = parseInt(this.state.size);
        this.state.size = num + .5;
      }
      document.getElementById("rfid").value = this.state.rfid;
      document.getElementById("sku").value = this.state.sku;
      this.closeSizeMenu();
    }

    sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
          break;
        }
      }
    }

    /*
      This function should call the batcher to create a transaction.
    */
    handleSubmit (event){
      const self = this;
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
        var response = response.json();
        return response.then(body => body)
      })
      .then(function(response) {
        var response = response;

        document.getElementById("transaction-id").innerHTML = "Transaction ID: " + response.data[0].id;
        if(response.data[0].invalid_transactions[0] !== undefined){
          document.getElementById("invalid-transaction").innerHTML = "Invalid transactions: " + response.data[0].invalid_transactions[0].message;
        }
        else{
          document.getElementById("invalid-transaction").innerHTML = "Invalid transactions: None"; 
        }
        document.getElementById("transaction-status").innerHTML = "Status: " + response.data[0].status;
        document.getElementById("transaction-link").innerHTML = "Link: " + response.link;
      });
      event.preventDefault();
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
            <p3 className="text" id="transaction-id" ><font size="6"></font></p3>
            <br></br>
            <p3 className="text" id="invalid-transaction"><font size="6"></font></p3>
            <br></br>
            <p3 className="text" id="transaction-status"><font size="6"></font></p3>
            <br></br>
            <p3 className="text" id="transaction-link"><font size="6"></font></p3>
            <br></br>
          </div>
        );
      }
}

export default AssetCreationPage;
