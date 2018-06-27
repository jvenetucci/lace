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
            <AssetTable assets={this.state.assets}/>
          </div>
        </div>
      </div>
    );
  }

  queryItems(sku, size) {
    var url = '/api/query'
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
        // console.log(jsonObj);
        var state = this.state;
        state.assets = jsonObj;
        this.setState(state);
      }))
    })
  }
}



export default App;
