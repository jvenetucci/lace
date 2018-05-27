import React from 'react'

const UserProfilePage = ({ match }) => (
  <div>
    User Profile for user: {match.params.userId}
  </div>
)

export default UserProfilePage