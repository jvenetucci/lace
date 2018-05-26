import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/LoginPage.css'


const ViewHistory = ({ history }) => (
  <div className="ViewHistory">
    <h1>Enter the RFID of an item to view its history</h1>
    <br/>
    <div className="RFID-history-form">
              <label>RFID</label>
              <input 
                type="text" 
                name="rfid"
                placeholder="RFID"
                onChange={this.handleChange} 
                required
              />
            </div>
    <button onClick={() => {
      login().then(() => {
        history.push('/app')
      })
    }}>Search</button>
  </div>
)

export default ViewHistory
