import React, { Component } from 'react';
import './App.css';
import SearchField from "./components/SearchField.js";
import AssetTable from './components/AssetTable.js';

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      assets: null
    }

    this.queryItems = this.queryItems.bind(this);
  }

  render() {
    return (
      <div className="App">
        <header className="Header">
          <h1 id="title">ShoeLocker</h1>
        </header>

        <div className="MainContent">
          <div id="SearchArea">
            <SearchField callback={this.queryItems}/>
          </div>
          <div id="TableArea">
            <AssetTable assets={this.state.assets} callback={this.reserveAssets}/>
          </div>
        </div>
      </div>
    );
  }

  reserveAssets(RFIDs, Users) {
    fetch('/api/lock', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rfidList: RFIDs,
        userList: Users
      })
    })
    .then(response => {
      console.log('Done');
      // //Need to extract the data from the response
      // const reader = response.body.getReader();
      // reader.read().then((({done, value}) => {
      //   //decode and parse into JSON
      //   var obj = new TextDecoder("utf-8").decode(value);
      //   let jsonObj = JSON.parse(obj);
  
      //   //Status code
      //   var touchStatus = jsonObj.data[0].status;
      //   //Link to get the real status code if this status code is pending (it is).
      //   var statusLink = jsonObj.link;
  
      //   //If we somehow got a non-pending result
      //   if(touchStatus !== 'PENDING') {
      //     document.getElementById('status').innerHTML = touchStatus;
      //   } else {
      //     this.sleep(250);
      //     //Check the returned url to find out the status of our transaction
      //     fetch('/api/status/Company', {
      //       method: 'POST',
      //       headers: {
      //         'Accept': 'application/json',
      //         'Content-Type': 'application/json',
      //       },
      //       body: JSON.stringify({
      //         url: statusLink,
      //       })
      //     })
          // .then(response => {
          //   //Read the response
          //   const statusCodeReader = response.body.getReader();
          //   statusCodeReader.read().then((({done, value}) => {
  
          //   //decode and parse into JSON
          //   var checkedStatusResponse = new TextDecoder("utf-8").decode(value);
          //   var jsoncheckedStatusResponse = JSON.parse(checkedStatusResponse);
          //   touchStatus = JSON.parse(jsoncheckedStatusResponse.body).data[0].status;
  
          //   document.getElementById('status').innerHTML = touchStatus;
  
          //   }))
          // });
    })}

  queryItems(sku, size) {
    var url = '/api/outsideQuery'
    if(sku === '' && size !== '') {
      url = url + '?size=' + size;
    } else if (sku !=='' && size === '') {
      url = url + '?sku=' + sku;
    } else if (sku !== '' && size !== '') {
      url = url + '?sku=' + sku + '&size=' + size;
    } else {
      return;
    }

    fetch(url).then(response => {
      //Need to extract the data from the response
      const reader = response.body.getReader();
      reader.read().then((({done, value}) => {

        //decode and parse into JSON
        var obj = new TextDecoder("utf-8").decode(value);
  
        //Extract the product info stored in the final array element
        let jsonObj = JSON.parse(obj);
        for(var i = 0; i < jsonObj.length; i ++) {
          console.log(jsonObj[i].status)
          if (jsonObj[i].status !== 'Recieved' || jsonObj[i].status !== 'In Store') {
          }
        }
        // console.log(jsonObj);
        var state = this.state;
        state.assets = jsonObj;
        this.setState(state);
      }))
    })
  }
}



export default App;
