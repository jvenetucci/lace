import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import UserNav from '../ui/UserNav'
// import '../styles/AssetsSubLayout.css'

// Sub Layouts
import AssetTransferPage from '../pages/AssetTransferPage'
import ViewAssetsPage from '../pages/ViewAssetsPage'
import UserProfilePage from '../pages/UserProfilePage'

const AssetsSubLayout = ({ match }) => (
  <div className="user-sub-layout">
    <aside>
      <UserNav />
    </aside>
    <div className="primary-content">
      <Switch>
        <Route path={match.path} exact component={AssetTransferPage} />
        <Route path={`${match.path}/view`} exact component={ViewAssetsPage} />
        <Route path={`${match.path}/:userId`}  component={UserProfilePage} />
      </Switch>
    </div>
  </div>
)

export default AssetsSubLayout