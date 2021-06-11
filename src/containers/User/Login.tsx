import React, { useState, useEffect } from 'react'
import { useRouter } from '../../utils/hooks/useRouter'
import { useUserState } from '../../contexts/UserState'
import { Link } from 'react-router-dom'
import { Form, Button, Container, Icon, Image, Header, Dropdown, List } from 'semantic-ui-react'
import isLoggedIn from '../../utils/helpers/loginCheck'
import strings from '../../utils/constants'
import messages from '../../utils/messages'
import { attemptLogin, attemptLoginOrg } from '../../utils/helpers/attemptLogin'
import { LoginPayload, OrganisationSimple } from '../../utils/types'
const logo = require('../../../images/logos/logo_512.png').default

const LOGIN_AS_NO_ORG = 0
const NO_ORG_SELECTED = -1

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isError, setIsError] = useState(false)
  const [networkError, setNetworkError] = useState('')
  const [loginPayload, setLoginPayload] = useState<LoginPayload>()
  const [selectedOrgId, setSelectedOrgId] = useState<number>(NO_ORG_SELECTED)
  const { push, history } = useRouter()
  const { onLogin } = useUserState()

  const noOrgOption: OrganisationSimple = {
    orgId: LOGIN_AS_NO_ORG,
    orgName: strings.LABEL_NO_ORG,
    userRole: null,
  }

  // useEffect ensures isLoggedIn only runs on first mount, not re-renders
  useEffect(() => {
    if (isLoggedIn()) push('/')
  }, [])

  const onLoginSuccess = (loginResult: LoginPayload) => {
    setIsError(false)
    setLoginPayload({
      ...loginResult,
    })
  }

  const handleSubmit = async () => {
    if (!loginPayload) {
      // User login
      attemptLogin({
        username,
        password,
        onLoginSuccess,
        onLoginFailure: () => setIsError(true),
      }).catch((error) => {
        setNetworkError(error.message)
      })
    }
  }

  const finishLogin = async (loginPayload: LoginPayload) => {
    const { JWT, user, templatePermissions } = loginPayload
    await onLogin(JWT, user, templatePermissions)
    if (history.location?.state?.from) push(history.location.state.from)
    else push('/')
  }

  useEffect(() => {
    if (loginPayload?.orgList?.length === LOGIN_AS_NO_ORG) {
      // No orgs, so skip org login
      finishLogin(loginPayload)
      return
    }
  }, [loginPayload])

  useEffect(() => {
    // Organisation login
    if (!loginPayload) return
    const orgId = selectedOrgId
    if (orgId === 0) {
      // Log in without organisation
      finishLogin(loginPayload)
      return
    }
    attemptLoginOrg({
      orgId,
      JWT: loginPayload.JWT,
      onLoginOrgSuccess: (loginOrgResult: LoginPayload) => {
        finishLogin(loginOrgResult)
      },
    }).catch((error) => {
      setNetworkError(error.message)
    })
  }, [selectedOrgId])

  return (
    <Container id="login-container">
      <div id="login-box">
        <div className="flex-centered">
          <Image src={logo} className="image-icon" />
          <Header as="h3" className="login-header">
            {strings.TITLE_LOGIN_HEADER}
          </Header>
        </div>
        <Header as="h2" className="centered header-space-around-medium">
          {loginPayload
            ? messages.LOGIN_WELCOME.replace('%1', loginPayload.user.firstName)
            : strings.TITLE_LOGIN}
        </Header>
        <Form>
          {isError && (
            <p className="alert">
              <Icon name="attention" />
              {strings.ERROR_LOGIN_PASSWORD}
            </p>
          )}
          {networkError && (
            <p className="alert">
              <Icon name="attention" />
              {networkError}
            </p>
          )}
          {!loginPayload && (
            <>
              <Form.Field error={isError} className="form-extra-spacing">
                <label>{strings.LABEL_LOGIN_USERNAME}</label>
                <input
                  placeholder={strings.LABEL_LOGIN_USERNAME}
                  name="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </Form.Field>
              <Form.Field error={isError}>
                <label>{strings.LABEL_LOGIN_PASSWORD}</label>
                <input
                  placeholder={strings.LABEL_LOGIN_PASSWORD}
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Form.Field>
              <Button id="login-button" primary fluid type="submit" onClick={handleSubmit}>
                {strings.LABEL_LOG_IN}
              </Button>
              <p className="center-text">
                <strong>
                  <Link to="/register">{strings.LINK_LOGIN_USER}</Link>
                </strong>
              </p>
            </>
          )}
          {loginPayload && loginPayload?.orgList && (
            <>
              <p>
                <strong>{messages.LOGIN_ORG_SELECT}</strong>
              </p>
              <List
                celled
                relaxed="very"
                className="no-bottom-border"
                items={[...loginPayload?.orgList, noOrgOption].map((org: OrganisationSimple) => ({
                  key: `list-item-${org.orgId}`,
                  content: (
                    <div
                      className="section-single-row-box-container clickable"
                      onClick={() => setSelectedOrgId(org.orgId)}
                    >
                      <div className="centered-flex-box-row flex-grow-1">
                        <span style={{ fontStyle: org.orgId === LOGIN_AS_NO_ORG ? 'italic' : '' }}>
                          {org.orgName}
                        </span>
                      </div>
                      <Icon name="chevron right" />
                    </div>
                  ),
                }))}
              />
            </>
          )}
        </Form>
      </div>
    </Container>
  )
}

export default Login
