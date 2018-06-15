import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import UserNav from '../ui/UserNav'

// Sub Layouts
import AssetTransferPage from '../pages/AssetTransferPage'
import ViewAssetsPage from '../pages/ViewAssetsPage'
import AssetCreationPage from '../pages/AssetCreationPage'
import AssetHistoryPage from '../pages/AssetHistoryPage'

const AssetsSubLayout = ({ match }) => (
  <div className="user-sub-layout">
    <aside>
      <UserNav/>
    </aside>
    <div className="primary-content">
      <Switch>
        <Route path={match.path} exact component={AssetTransferPage} />
        <Route path={`${match.path}/create`}  component={AssetCreationPage} />
        <Route path={`${match.path}/view`} exact component={ViewAssetsPage} />
        <Route path={`${match.path}/history`} exact component={AssetHistoryPage} />
      </Switch>
    </div>
  </div>
)

export default AssetsSubLayout