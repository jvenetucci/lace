import React from 'react'
import { NavLink } from 'react-router-dom'

const PrimaryHeader = () => (
  <header className="primary-header">
    <h1>Factory Manager</h1>
    <nav>
      <NavLink to="/app" exact activeClassName="active">Home</NavLink>
      <NavLink to="/app/inventory" activeClassName="active">Inventory</NavLink>
    </nav>
  </header>
)

export default PrimaryHeader