import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import UserNav from '../ui/UserNav'

// Sub Layouts
import AssetTransferPage from '../pages/AssetTransferPage'
import ViewAssetsPage from '../pages/ViewAssetsPage'

// The sublayout that renders the pages related to a factory's asset related actions.
const AssetsSubLayout = ({ match }) => (
  <div className="user-sub-layout">
    <aside>
      <UserNav />
    </aside>
    <div className="primary-content">
      <Switch>
        <Route path={match.path} exact component={AssetTransferPage} />
        <Route path={`${match.path}/view`} exact component={ViewAssetsPage} />
      </Switch>
    </div>
  </div>
)

export default AssetsSubLayout