import React from 'react'
import { NavLink } from 'react-router-dom'

const PrimaryHeader = () => (
  <div className="PrimaryHeader">
    
    <header className="primary-header">
      <nav>
        <NavLink to="/app" exact activeClassName="active">Home</NavLink>
        <NavLink to="/app/assets" activeClassName="active">Assets</NavLink>
      </nav>
    </header>
  </div>
)

export default PrimaryHeader