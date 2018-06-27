import React, { Component } from 'react';

class SearchField extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sku: '',
            size:'',
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSkuChange = this.handleSkuChange.bind(this);
        this.handleSizeChange = this.handleSizeChange.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault()
        this.props.callback(this.state.sku, this.state.size);
    }

    handleSkuChange(event) {
        var state = this.state;
        state.sku = event.target.value;
        this.setState(state);
    }

    handleSizeChange(event) {
        var state = this.state;
        state.size = event.target.value;
        this.setState(state);    
    }

    render() {
        return(
            <form id="SearchField" onSubmit={this.handleSubmit}>
                <label>SKU: </label><input value={this.state.value} onChange={this.handleSkuChange} type="text" name="sku"/>
                <label>Size: </label><input value={this.state.value} onChange={this.handleSizeChange} type="text" name="size"/>
                <input id="SearchButton" type="submit" value="Search" />
            </form>
        );
    }
}

export default SearchField;