import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'

const UserNav = ({ match }) => (
  <nav className="context-nav">
    <NavLink to={`${match.path}`} exact activeClassName="active">Transfer</NavLink>
    <NavLink to={`${match.path}/view`} activeClassName="active">View</NavLink>
  </nav>
)

export default withRouter(UserNav)