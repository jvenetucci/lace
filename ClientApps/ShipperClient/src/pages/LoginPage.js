import React from 'react'
import { Link } from 'react-router-dom'
import { login } from '../utils/xhr'
import '../styles/LoginPage.css'

const LoginPage = ({ history }) => (
  <div className="LoginPage">
    <h1>Shipper Login Page</h1>
    <br/>
    <button onClick={() => {
      login(0).then(() => {
        history.push('/app')
      })
    }}>Login Truck</button>
    <br/>
    <button onClick={() => {
      login(1).then(() => {
        history.push('/app')
      })
    }}>Login Boat</button>
    <br/>
    <button onClick={() => {
      login(2).then(() => {
        history.push('/app')
      })
    }}>Login Truck2</button>
    <br/>
  </div>
)

export default LoginPage