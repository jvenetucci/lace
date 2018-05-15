import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import UserNav from '../ui/UserNav'

import ViewHistoryPage from '../pages/ViewHistory'

const ProductSubLayout = ({ match }) => (
  <div className="product-sub-layout">
    <div className="primary-content">
      <Switch>
        <Route path={match.path} exact component={ViewHistoryPage} />
      </Switch>
    </div>
  </div>
)

export default ProductSubLayout

//<Route path={`${match.path}/add`} exact component={AddUserPage} />
//<Route path={`${match.path}/:userId`}  component={UserProfilePage} />