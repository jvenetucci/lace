import React from 'react'
import { logout } from '../utils/xhr'
import '../styles/AppHomePage.css'

const AppHomePage = ({ history }) => (
  <div className="AppHomePage">
    <h1>Hey Owner!</h1>
    <p>Using this client you can create and view assets in your inventory. You can also create new assets.</p>
    <br /><br />
    <button onClick={() => {
      logout().then(() => {
        history.push('/')
      })
    }}>Logout</button>
  </div>
)

export default AppHomePage