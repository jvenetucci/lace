import React from 'react'
import { Link } from 'react-router-dom'
import { login } from '../utils/xhr'

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