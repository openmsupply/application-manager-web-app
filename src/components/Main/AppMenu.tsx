import React from 'react'
import { Header, Menu } from 'semantic-ui-react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { useRouter } from '../../utils/hooks/useRouter'
import { TemplatesDetails } from '../../utils/types'

interface AppMenuProps extends RouteComponentProps {
  templatePermissions: TemplatesDetails
}

const AppMenu: React.FC<AppMenuProps> = ({ templatePermissions }) => {
  const {
    pathname,
    query: { type },
  } = useRouter()

  return (
    templatePermissions && (
      <Menu fluid inverted pointing secondary>
        <Menu.Item
          key={`app_menu_home`}
          content={<Header as="h5" inverted icon="home" />}
          active={pathname === '/'}
          as={Link}
          to={'/'}
        />
        {/*templatePermissions.map(({ name, code, permissions }) => (
          <Menu.Item
            key={`app_menu_${name}`}
            content={<Header as="h5" inverted content={name} />}
            active={type === code}
            as={Link}
            to={`/applications?type=${code}`}
          />
        ))*/}
      </Menu>
    )
  )
}

export default withRouter(AppMenu)
