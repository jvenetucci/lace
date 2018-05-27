import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import AuthorizedRoute from './AuthorizedRoute'
import store from './store'
// Layouts
import UnauthorizedLayout from './layouts/UnauthorizedLayout'
import PrimaryLayout from './layouts/PrimaryLayout'


const App = props => (
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route path="/auth" component={UnauthorizedLayout} />
        <AuthorizedRoute path="/app" component={PrimaryLayout} />
        <Redirect to="/auth" />
      </Switch>
    </BrowserRouter>
  </Provider> 
)


export default App;