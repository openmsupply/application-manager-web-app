import React from 'react'
import { Footer } from '../../components'
import SiteLayout from './SiteLayout'
import { Container } from 'semantic-ui-react'
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
