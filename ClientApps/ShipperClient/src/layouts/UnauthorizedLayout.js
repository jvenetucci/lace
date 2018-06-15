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
import { Switch, Route, Redirect } from 'react-router-dom'

// Pages
import LoginPage from '../pages/LoginPage'

const UnauthorizedLayout = () => (
  <div className="unauthorized-layout">
    {/*
    
    Imagine this could be a general layout for all unauthorized pages like
    the login page, forgot password, email-verified, etc...
    
    For this example project, we'll just have a Login Page
    
    */}
    <Switch>
      <Route path="/auth/login" component={LoginPage} />
      <Redirect to="/auth/login" />
    </Switch>
  </div>
)

export default UnauthorizedLayout