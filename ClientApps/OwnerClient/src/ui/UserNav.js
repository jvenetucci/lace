import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'

const UserNav = ({ match }) => (
  <nav className="context-nav">
    <NavLink to={`${match.path}`} exact activeClassName="active">Transfer</NavLink>
    <NavLink to={`${match.path}/create`} activeClassName="active">Create</NavLink>
    <NavLink to={`${match.path}/view`} activeClassName="active">View</NavLink>
    <NavLink to={`${match.path}/history`} activeClassName="active">History</NavLink>
  </nav>
)

export default withRouter(UserNav)