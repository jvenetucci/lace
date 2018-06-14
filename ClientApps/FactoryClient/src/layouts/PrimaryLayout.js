import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import PrimaryHeader from '../ui/PrimaryHeader'
import AppHomePage from '../pages/AppHomePage'

// Sub Layout
import AssetsSubLayout from './AssetsSubLayout'

// This is the only actual page in the app. It loads the asset sublayout which is where everything happens.
const PrimaryLayout = ({ match }) => (
  <div className="primary-layout">
    <PrimaryHeader />
    <main>
      <Switch>
        <Route path={`${match.path}`} exact component={AppHomePage} />
        <Route path={`${match.path}/Assets`} component={AssetsSubLayout} />
        
        <Redirect to={`${match.url}`} />
      </Switch>
    </main>
  </div>
)

export default PrimaryLayout