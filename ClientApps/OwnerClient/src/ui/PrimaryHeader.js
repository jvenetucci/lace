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