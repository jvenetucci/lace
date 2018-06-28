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
import { NavLink, withRouter } from 'react-router-dom'

const UserNav = ({ match }) => (
  <nav className="context-nav">
    <NavLink to={`${match.path}`} exact activeClassName="active">Transfer</NavLink>
    <NavLink to={`${match.path}/create`} activeClassName="active">Create</NavLink>
    <NavLink to={`${match.path}/view`} activeClassName="active">View</NavLink>
    <NavLink to={`${match.path}/history`} activeClassName="active">History</NavLink>
    <NavLink to={`${match.path}/unlock`} activeClassName="active">Unlock</NavLink>
  </nav>
)

export default withRouter(UserNav)