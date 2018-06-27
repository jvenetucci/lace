import React, { Component } from 'react';

class Asset extends Component {
    constructor(props) {
        super(props)

        this.toggle = this.toggle.bind(this);
    }

    render() {
        if (this.props.asset !== undefined) {
            return(
                <tr className='Asset'>
                    <td>{this.props.asset.agent_public_key}</td>
                    <td>{this.props.asset.sku}</td>
                    <td>{this.props.asset.size}</td>
                    <td>{this.props.asset.rfid}</td>
                    <td><input onChange={this.toggle} type="checkbox" name="reserve"/></td>
                </tr>
            )
        } else {
            return null;
        }
    }

    toggle() {
        this.props.callback(this.props.asset.rfid, this.props.asset.agent_public_key);
    }
}


export default Asset;