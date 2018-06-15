/* Team B is comprised of the following individuals:
    - Roberto Avila
    - Andrew Burnett
    - Jeff De La Mare
    - Nick Nation
    - Phillip Nguyen
    - Anthony Tran
    - Joseph Venetucci

[This program is licensed under the "MIT License"]
Please see the file LICENSE.md in the 
source distribution of this software for license terms.

This software also makes use of Hyperledger Sawtooth which is
licensed under Apache 2.0. A copy of it's license and copyright
are contained in sawtooth-license.md and sawtooth-copyright.md */


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