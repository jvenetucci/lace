import React, { Component } from 'react';
import Asset from './Asset';

class AssetTable extends Component {
    constructor(props) {
        super(props)

        this.state = {
            RFIDS: []
        }

        this.toggleRFID = this.toggleRFID.bind(this);
    }

    render() {
        if (this.props.assets) {
          if (this.props.assets.length === 0) {
              return (
                  <p>No assets found</p>
              )
          } else {
            return (
                <div>
                <table>
                    <tbody>
                    <tr>
                        <th>Location</th>
                        <th>Sku</th>
                        <th>Size</th>
                        <th>RFID</th>
                    </tr>
                    {/* The code below takes each item and creates a table row out of it using Item.js */}
                    {this.props.assets.map((asset => (<Asset key={asset.rfid} asset={asset} callback={this.toggleRFID}/>)))}
                    </tbody>
                </table>
                </div>
            );}
    } else {
        return null;
    }}

    toggleRFID(rfid) {
        var state = this.state;
        var index = state.RFIDS.indexOf(rfid);
        if (index > -1) {
            state.RFIDS.splice(index, 1)
        } else {
            state.RFIDS.push(rfid);
        }
        // console.log(this.state);
        this.setState(state);
    }
}

export default AssetTable;