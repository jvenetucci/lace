import React, { Component } from 'react';
import logo from './logo.svg';
import './styles/App.css';

import Form from './Form';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Asset Tracker</h1>
        </header>
        <div className="container">
          <Form/>
        </div>
      </div>
    );
  }
}

export default App;
