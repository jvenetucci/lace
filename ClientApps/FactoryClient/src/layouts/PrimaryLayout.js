import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import PrimaryHeader from '../ui/PrimaryHeader'
import AppHomePage from '../pages/AppHomePage'

// Sub Layouts
import UserSubLayout from './UserSubLayout'
import ProductSubLayout from './ProductSubLayout'

const PrimaryLayout = ({ match }) => (
  <div className="primary-layout">
    <PrimaryHeader />
    <main>
      <Switch>
        <Route path={`${match.path}`} exact component={AppHomePage} />
        <Route path={`${match.path}/inventory`} component={UserSubLayout} />
        <Route path={`${match.path}/history`} component={ProductSubLayout}/>
        
        <Redirect to={`${match.url}`} />
      </Switch>
    </main>
  </div>
)

//<Route path={`${match.path}/products`} component={ProductSubLayout} />

export default PrimaryLayout