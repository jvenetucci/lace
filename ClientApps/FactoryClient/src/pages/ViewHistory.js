import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/LoginPage.css'
import { login } from '../utils/xhr'

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
      //This doesn't do much now. Add onto the end of /app to change the page this when you click ç
        history.push('/app')
    }}>View History</button>
  </div>
)

export default ViewHistory
