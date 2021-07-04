import React, { SyntheticEvent } from 'react'
import { Button, Container, Icon, Image, List, Dropdown } from 'semantic-ui-react'
import { useUserState } from '../../contexts/UserState'
import { attemptLoginOrg } from '../../utils/helpers/attemptLogin'
import { Link } from 'react-router-dom'
import strings from '../../utils/constants'
import { OrganisationSimple, User, LoginPayload } from '../../utils/types'
import config from '../../config'
import { getFullUrl } from '../../utils/helpers/utilityFunctions'

const UserArea: React.FC = () => {
  const {
    userState: { currentUser, orgList },
    onLogin,
  } = useUserState()

  if (!currentUser || currentUser?.username === strings.USER_NONREGISTERED) return null

  return (
    <Container id="user-area">
      <div id="user-area-left">
        <MainMenuBar />
        {orgList.length > 0 && <OrgSelector user={currentUser} orgs={orgList} onLogin={onLogin} />}
      </div>
      <UserMenu user={currentUser as User} />
    </Container>
  )
}

const MainMenuBar: React.FC = () => {
  const {
    userState: { currentUser },
  } = useUserState()

  // TO-DO: Logic for deducing what should show in menu bar
  // Probably passed in as props
  return (
    <div id="menu-bar">
      <List horizontal>
        <List.Item>
          <Link to="/" className="selected-link">
            {/* <Icon name="home" /> */}
            {strings.MENU_ITEM_DASHBOARD}
          </Link>
        </List.Item>
        <List.Item>
          <Link to="/outcomes">Outcomes</Link>
        </List.Item>
        <List.Item>
          <Link to="/application/new?type=UserEdit">Edit User Account</Link>
        </List.Item>
        {(currentUser?.username || '').toLowerCase() === 'admin' && (
          <List.Item>
            <Link to="/admin">Admin Configurations</Link>
          </List.Item>
        )}
      </List>
    </div>
  )
}

const OrgSelector: React.FC<{ user: User; orgs: OrganisationSimple[]; onLogin: Function }> = ({
  user,
  orgs,
  onLogin,
}) => {
  const LOGIN_AS_NO_ORG = 0 // Ensures server returns no organisation

  const JWT = localStorage.getItem('persistJWT') as string

  const handleChange = async (_: SyntheticEvent, { value: orgId }: any) => {
    await attemptLoginOrg({ orgId, JWT, onLoginOrgSuccess })
  }
  const onLoginOrgSuccess = async ({ user, orgList, templatePermissions, JWT }: LoginPayload) => {
    await onLogin(JWT, user, templatePermissions, orgList)
  }
  const dropdownOptions = orgs.map(({ orgId, orgName }) => ({
    key: orgId,
    text: orgName,
    value: orgId,
  }))
  dropdownOptions.push({
    key: LOGIN_AS_NO_ORG,
    text: strings.LABEL_NO_ORG,
    value: LOGIN_AS_NO_ORG,
  })
  return (
    <div id="org-selector">
      {user?.organisation?.logoUrl && (
        <Image src={getFullUrl(user?.organisation?.logoUrl, config.serverREST)} />
      )}
      <div>
        <Dropdown
          text={user?.organisation?.orgName || strings.LABEL_NO_ORG}
          options={dropdownOptions}
          onChange={handleChange}
        ></Dropdown>
      </div>
    </div>
  )
}

const UserMenu: React.FC<{ user: User }> = ({ user }) => {
  const { logout } = useUserState()
  return (
    <div id="user-menu">
      <Button animated onClick={() => logout()}>
        <Button.Content visible>
          {user?.firstName || ''} {user?.lastName || ''}
        </Button.Content>
        <Button.Content hidden>
          <Icon name="log out" />
        </Button.Content>
      </Button>
    </div>
  )
}

export default UserArea
