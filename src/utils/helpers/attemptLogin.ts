import { postRequest } from './fetchMethods'
import config from '../../config'
import { LoginPayload } from '../types'

const loginURL = config.serverREST + '/login'
const loginOrgURL = config.serverREST + '/login-org'

interface loginParameters {
  username: string
  password: string
  onLoginSuccess: Function
  onLoginFailure?: Function
}
interface loginOrgParameters {
  orgId: number
  JWT: string
  onLoginOrgSuccess: Function
  onLoginOrgFailure?: Function
}

export const attemptLogin = async ({
  username,
  password,
  onLoginSuccess,
  onLoginFailure = () => {},
}: loginParameters) => {
  try {
    const loginResult: LoginPayload = await postRequest({ username, password }, loginURL)

    if (!loginResult.success) {
      onLoginFailure()
    } else onLoginSuccess(loginResult)
  } catch (err) {
    throw err
  }
}

export const attemptLoginOrg = async ({
  orgId,
  JWT,
  onLoginOrgSuccess,
  onLoginOrgFailure = () => {},
}: loginOrgParameters) => {
  try {
    const authHeader = { Authorization: 'Bearer ' + JWT }
    const loginResult: LoginPayload = await postRequest({ orgId }, loginOrgURL, authHeader)

    if (!loginResult.success) {
      onLoginOrgFailure()
    } else onLoginOrgSuccess(loginResult)
  } catch (err) {
    throw err
  }
}
