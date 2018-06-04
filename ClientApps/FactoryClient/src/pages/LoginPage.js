import React from 'react'
import { Link } from 'react-router-dom'
import { login } from '../utils/xhr'

// This is the login page. In this app it does nothing spectacular.
const LoginPage = ({ history }) => (
  <div>
    <h1>Factory Client</h1>
    <br/>
    <p>
      
    </p>
    <br/>
    <button onClick={() => {
      login().then(() => {
        history.push('/app')
      })
    }}>Login</button>
  </div>
)

export default LoginPage