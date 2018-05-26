import React from 'react'
import { logout } from '../utils/xhr'
import '../styles/AppHomePage.css'

const AppHomePage = ({ history }) => (
  <div className="AppHomePage">
    <h1>Hey Shipper!</h1>
    <p>Using this client you can transfer assets into your inventory, and view assets in your inventory.</p>
    <br /><br />
    <button onClick={() => {
      logout().then(() => {
        history.push('/')
      })
    }}>Logout</button>
  </div>
)

export default AppHomePage