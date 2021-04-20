import React from 'react'
import SiteLayout from './SiteLayout'
import isLoggedIn from '../../utils/helpers/loginCheck'
import { Redirect } from 'react-router'

const AuthenticatedContent: React.FC = () => {
  return isLoggedIn() ? (
    <SiteLayout />
  ) : (
    <Redirect to={{ pathname: '/login', state: { from: location.pathname } }} />
  )
}

export default AuthenticatedContent
