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