import React, { useState, useEffect } from 'react'
import { useRouter } from '../../utils/hooks/useRouter'
import isLoggedIn from '../../utils/helpers/loginCheck'
import { attemptLogin } from '../../utils/helpers/attemptLogin'
import { useUserState } from '../../contexts/UserState'
import messages from '../../utils/messages'
import strings from '../../utils/constants'
import { LoginPayload } from '../../utils/types'

const UserRegister: React.FC = () => {
  const [networkError, setNetworkError] = useState('')
  const { push } = useRouter()
  const { onLogin } = useUserState()

  // useEffect ensures isLoggedIn only runs on first mount, not re-renders
  useEffect(() => {
    if (isLoggedIn()) push('/')
  }, [])

  useEffect(() => {
    // Log in as 'nonRegistered' user to be able to apply for User Registration form

    attemptLogin({
      username: strings.USER_NONREGISTERED,
      password: '',
      onLoginSuccess,
    }).catch((error) => {
      setNetworkError(error.message)
    })
  }, [])

  const onLoginSuccess = async (loginResult: LoginPayload) => {
    const { JWT, user, templatePermissions, isAdmin } = loginResult
    await onLogin(JWT, user, templatePermissions, isAdmin)
    push('/application/new?type=UserRegistration')
  }

  if (networkError) return <p>{networkError}</p>
  else return <p>{messages.REDIRECT_TO_REGISTRATION}</p>
}

export default UserRegister
