import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'

const UserNav = ({ match }) => (
  <nav className="context-nav">
    <NavLink to={`${match.path}`} exact activeClassName="active">Browse</NavLink>
    <NavLink to={`${match.path}/add`} activeClassName="active">Add</NavLink>
  </nav>
)

export default withRouter(UserNav)