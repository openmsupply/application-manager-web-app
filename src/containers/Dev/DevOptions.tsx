import React, { CSSProperties } from 'react'
import { Dropdown } from 'semantic-ui-react'
import { useUserState } from '../../contexts/UserState'
import useListTemplates from '../../utils/hooks/useListTemplates'
import UserSelection from './UserSelection'
import AppMenu from './AppMenu'

const DevOptions: React.FC = () => {
  const {
    userState: { isLoading, templatePermissions },
  } = useUserState()

  const {
    templatesData: { templates, templatesByCategory },
  } = useListTemplates(templatePermissions, isLoading)

  console.log(templatesByCategory)
  return (
    <div id="dev-options" style={menuStyle}>
      <Dropdown item icon="user">
        <UserSelection />
      </Dropdown>
      <Dropdown item icon="map">
        <AppMenu templatePermissions={templates} />
      </Dropdown>
    </div>
  )
}

const menuStyle = {
  zIndex: 0,
  position: 'fixed',
  right: 0,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
} as CSSProperties

export default DevOptions
