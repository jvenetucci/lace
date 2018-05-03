import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import '../styles/AssetCreationPage.css'

class AssetCreationPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            sku: '',
            model: '',
            size: '',
            manufactureDate: ''
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
      this.setState({ [event.target.name]: event.target.value });
    }

    /*
      This function should call the batcher to create a transaction.
    */
    handleSubmit(event) {
      alert(
        "Product Info\nID: " + this.state.id +
        "\nSKU: " + this.state.sku +
        "\nModel: " + this.state.model +
        "\nSize: " + this.state.size + 
        "\nManufacture Date: " + this.state.manufactureDate
      );
      //createTransaction("Create", 
      // this.state.model,
      // this.state.size,
      // this.state.sku,
      // this.state.id,
      // this.state.manufactureDate
      //);
      event.preventDefault();
    }

    render() {
        return (
          <div className="AssetCreationPage">
            <form onSubmit={this.handleSubmit}>
              <legend>Asset Creation Form</legend>
              <div className="form-group">
                <label>Product ID</label>
                <input 
                  type="text" 
                  name="id"
                  placeholder="Product ID"
                  onChange={this.handleChange} 
                  required
                />
              </div>
              <div className="form-group">
                <label>SKU:&emsp;</label>
                <input 
                  type="text" 
                  name="sku" 
                  placeholder="SKU"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="row">
                    <div className="form-group">
                    <label>Model</label>
                    <input 
                      type="text" 
                      name="model" 
                      placeholder="Model"
                      onChange={this.handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Size</label>
                    <input 
                      type="text"
                      placeholder="Size"
                      name="size" 
                      onChange={this.handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Manufacture Date</label>
                    <input 
                      type="date" 
                      name="manufactureDate" 
                      placeholder="Manufature Date"
                      onChange={this.handleChange}
                      required
                    />
                  </div>
              </div>
              <div className="btn-submit">
                <input type="submit" value="Submit" />
              </div>
            </form>
          </div>
        );
      }
}

export default AssetCreationPage;
