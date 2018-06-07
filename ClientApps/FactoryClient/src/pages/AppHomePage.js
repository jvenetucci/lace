import React from 'react'
import { logout } from '../utils/xhr'
import '../styles/AppHomePage.css'

// Main page. Nothing cool happens here.
const AppHomePage = ({ history }) => (
  <div className="AppHomePage">
    <h1>Hey Factory!</h1>
    <p>Using this client you can transfer assets into your inventory.</p>
    <br /><br />
    <button onClick={() => {
      logout().then(() => {
        history.push('/')
      })
    }}>Logout</button>
  </div>
)

export default AppHomePage