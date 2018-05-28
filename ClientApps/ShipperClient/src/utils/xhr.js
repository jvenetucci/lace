import store from '../store'

// These are "fake network" function that in a real scenario would
// call the backend API and upon return would update your redux state.
// We're just going to skip to the redux part and add a setTimeout
// for some fake latency

export var userCode = -1;

export const getLoggedUser = () => {
  setTimeout(() => {
    store.dispatch({
      type: 'GET_LOGGED_USER',
      user: userCode === 0 ? 'Shipper' : userCode === 1 ? 'ShipperBoat' : 'ShipperTruck2'
    })
  }, 500)
}

export const login = (loginCode) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      store.dispatch({
        type: 'SET_LOGGED_USER',
        logged: true
      })
      userCode = loginCode;
      resolve()
    }, 500)
  })
}

export const logout = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      store.dispatch({
        type: 'SET_LOGGED_USER',
        logged: false
      })
      userCode = -1;
      resolve()
    }, 500)
  })
}