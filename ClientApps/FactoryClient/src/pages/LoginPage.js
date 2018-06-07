import React from 'react'
import { Link } from 'react-router-dom'
import { login } from '../utils/xhr'
import '../styles/LoginPage.css'

// This is the login page. In this app it does nothing spectacular.
const LoginPage = ({ history }) => (
  <div className="LoginPage">
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