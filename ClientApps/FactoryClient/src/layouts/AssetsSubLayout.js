/* Team B is comprised of the following individuals:
    - Roberto Avila
    - Andrew Burnett
    - Jeff De La Mare
    - Nick Nation
    - Phillip Nguyen
    - Anthony Tran
    - Joseph Venetucci

[This program is licensed under the "MIT License"]
Please see the file LICENSE.md in the 
source distribution of this software for license terms.

This software also makes use of Hyperledger Sawtooth which is
licensed under Apache 2.0. A copy of it's license and copyright
are contained in sawtooth-license.md and sawtooth-copyright.md */


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