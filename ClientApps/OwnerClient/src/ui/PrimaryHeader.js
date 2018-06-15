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
import { NavLink } from 'react-router-dom'
import logo from '../Columns.svg'
import '../styles/PrimaryHeader.css'

const PrimaryHeader = () => (
  <div className="PrimaryHeader">
    <img src={logo} className="Columns-logo" alt="logo" />
    <header className="primary-header">
      <nav>
        <NavLink to="/app" exact activeClassName="active">Home</NavLink>
        <NavLink to="/app/assets" activeClassName="active">Assets</NavLink>
      </nav>
    </header>
  </div>
)

export default PrimaryHeader