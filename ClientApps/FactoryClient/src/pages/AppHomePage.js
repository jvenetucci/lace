import React from 'react'
import { logout } from '../utils/xhr'

const AppHomePage = ({ history }) => (
  <div>
    Home
    <br /><br />
    <button onClick={() => {
      logout().then(() => {
        history.push('/')
      })
    }}>Logout</button>
  </div>
)

export default AppHomePage