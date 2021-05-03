import React from 'react'
import { Button, Container, Icon, Image, List } from 'semantic-ui-react'
import { useUserState } from '../../contexts/UserState'
import { Link } from 'react-router-dom'
import strings from '../../utils/constants'
import { User } from '../../utils/types'
import config from '../../config'
import { getFullUrl } from '../../utils/helpers/utilityFunctions'

const UserArea: React.FC = () => {
  const {
    userState: { currentUser },
  } = useUserState()
  const isRegistered = currentUser?.username !== 'nonRegistered'
  return (
    <Container id="user-area">
      {isRegistered && (
        <>
          <div id="user-area-left">
            <MainMenuBar />
            {currentUser?.organisation?.orgName && <OrgSelector user={currentUser} />}
          </div>
          <UserMenu user={currentUser as User} />
        </>
      )}
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
          <Link to="/layoutHelpers">Layout Helpers</Link>
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
        <Icon size="small" name="angle down" />
      </div>
    </div>
  )
}

const UserMenu: React.FC<{ user: User }> = ({ user }) => {
  const { logout } = useUserState()
  return (
    <div id="user-menu">
      <Button onClick={() => logout()}>
        {user?.firstName || ''} {user?.lastName || ''}
        <Icon style={{ marginLeft: 4, marginRight: 2 }} size="large" name="log out" />
      </Button>
    </div>
  )
}

export default UserArea
