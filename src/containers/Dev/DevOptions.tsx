import React, { CSSProperties } from 'react'
import { Dropdown } from 'semantic-ui-react'
import Snapshots from './Snapshots'
import UserSelection from './UserSelection'

const DevOptions: React.FC = () => {
  return (
    <div id="dev-options" style={menuStyle}>
      <Dropdown item icon="user">
        <UserSelection />
      </Dropdown>

      <Dropdown item icon="file video outline">
        <Snapshots />
      </Dropdown>
    </div>
  )
}

const menuStyle = {
  zIndex: 20,
  position: 'fixed',
  right: 15,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
} as CSSProperties

export default DevOptions
