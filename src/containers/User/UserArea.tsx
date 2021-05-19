import React from 'react'
import { Button, Container, Icon, Image, List } from 'semantic-ui-react'
import { useUserState } from '../../contexts/UserState'
import { Link } from 'react-router-dom'
import strings from '../../utils/constants'
import { User } from '../../utils/types'
import config from '../../config.json'
import { getFullUrl } from '../../utils/helpers/utilityFunctions'

const UserArea: React.FC = () => {
  const {
    userState: { currentUser },
  } = useUserState()

  if (!currentUser || currentUser?.username === strings.USER_NONREGISTERED) return null

  return (
    <Container id="user-area">
      <div id="user-area-left">
        <MainMenuBar />
        {currentUser?.organisation?.orgName && <OrgSelector user={currentUser} />}
      </div>
      <UserMenu user={currentUser as User} />
    </Container>
  )
}

const MainMenuBar: React.FC = () => {
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
          <Link to="/layout">Layout helpers</Link>
        </List.Item>
        <List.Item>
          <Link to="/application/new?type=UserEdit">Edit User Account</Link>
        </List.Item>
      </List>
    </div>
  )
}

const OrgSelector: React.FC<{ user: User }> = ({ user }) => {
  // TO-DO: Make into Dropdown so Org can be selected
  return (
    <div id="org-selector">
      {user?.organisation?.logoUrl && (
        <Image src={getFullUrl(user?.organisation?.logoUrl, config.serverREST)} />
      )}
      <div>
        {user?.organisation?.orgName || ''}
        <Icon size="small" name="chevron down" />
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
