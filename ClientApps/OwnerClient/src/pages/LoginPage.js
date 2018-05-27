import React from 'react'
import { Link } from 'react-router-dom'
import { login } from '../utils/xhr'
import '../styles/LoginPage.css'

const LoginPage = ({ history }) => (
  <div className="LoginPage">
    <h1>Owner Login Page</h1>
    <br/>
    <button onClick={() => {
      login().then(() => {
        history.push('/app')
      })
    }}>Login</button>
  </div>
)

export default LoginPage