import React, { CSSProperties, useEffect, useState } from 'react'
import {
  Button,
  Dropdown,
  Grid,
  Icon,
  Input,
  Label,
  Loader,
  Popup,
  Portal,
  Segment,
} from 'semantic-ui-react'
import { useUserState } from '../../contexts/UserState'
import useListTemplates from '../../utils/hooks/useListTemplates'
import UserSelection from './UserSelection'
import AppMenu from './AppMenu'
import config from '../../config'

const DevOptions: React.FC = () => {
  const {
    userState: { isLoading, templatePermissions },
  } = useUserState()

  const { filteredTemplates } = useListTemplates(templatePermissions, isLoading)
  return (
    <div id="dev-options" style={menuStyle}>
      <Dropdown item icon="user">
        <UserSelection />
      </Dropdown>
      <Dropdown item icon="map">
        <AppMenu templatePermissions={filteredTemplates} />
      </Dropdown>
      <Dropdown item icon="file video outline">
        <Snapshots />
      </Dropdown>
    </div>
  )
}

const snapshotsBaseUrl = `${config.serverREST}/snapshots`
const snapshotListUrl = `${snapshotsBaseUrl}/list`
const takeSnapshotUrl = `${snapshotsBaseUrl}/take`
const useSnapshotUrl = `${snapshotsBaseUrl}/use/`

const NewSnapshot: React.FC<{ takeSnapshot: (name: string) => void }> = ({ takeSnapshot }) => {
  const [value, setValue] = useState('')

  return (
    <div>
      <Input size="mini" onChange={(_, { value }) => setValue(value)} placeholder="New Snapshot" />
      <Icon className="clickable" name="record" onClick={() => takeSnapshot(value)} />
    </div>
  )
}

const Snapshots: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const [isSnapshotError, setIsSnapshotError] = useState(false)

  const [data, setData] = useState<string[] | null>(null)

  const getList = async () => {
    try {
      const snapshotListRaw = await fetch(snapshotListUrl, { method: 'GET' })
      const snapshotList: string[] = (await snapshotListRaw.json()).availableSnapshots

      setData(snapshotList)
    } catch (e) {}
  }

  const normaliseSnapshotName = (name: string) =>
    // not word, not digit
    name.replace(/[^\w\d]/g, '_')

  const takeSnapshot = async (name: string) => {
    setIsOpen(false)
    setIsPortalOpen(true)
    try {
      const resultRaw = await fetch(`${takeSnapshotUrl}?name=${normaliseSnapshotName(name)}`, {
        method: 'GET',
      })
      const resultJson = await resultRaw.json()

      if (resultJson.success) return setIsPortalOpen(false)

      setIsSnapshotError(true)
    } catch (e) {}
  }

  const useSnapshot = async (name: string) => {
    setIsOpen(false)
    setIsPortalOpen(true)
    try {
      const resultRaw = await fetch(`${useSnapshotUrl}/${name}`, {
        method: 'GET',
      })
      const resultJson = await resultRaw.json()

      if (resultJson.success) return setIsPortalOpen(false)

      setIsSnapshotError(true)
    } catch (e) {}
  }

  useEffect(() => {
    if (isOpen) {
      setData(null)
      getList()
    }
  }, [isOpen])

  const renderInner = () => {
    if (!data) return <NewSnapshot takeSnapshot={takeSnapshot} />
    return (
      <Grid.Column>
        {data.map((snapshotName) => (
          <Grid.Row key={`app_menu_${snapshotName}`}>
            <div>
              <Label>{snapshotName}</Label>
              <Icon
                className="clickable"
                name="play circle"
                onClick={() => useSnapshot(snapshotName)}
              />
              <Icon
                className="clickable"
                name="record"
                onClick={() => takeSnapshot(snapshotName)}
              />
              <a href={`${config.serverREST}/snapshotZips/${snapshotName}.zip`} target="_blank">
                <Icon name="download" onClick={() => console.log('yow')} />
              </a>
            </div>
          </Grid.Row>
        ))}
        <Grid.Row key={`app_menu_record_new_snapshot`}>
          <NewSnapshot takeSnapshot={takeSnapshot} />
        </Grid.Row>
      </Grid.Column>
    )
  }

  return (
    <>
      <Portal open={isPortalOpen}>
        <Segment
          style={{
            left: '40%',
            position: 'fixed',
            top: '50%',
            zIndex: 1000,
            width: 200,
            height: 100,
          }}
        >
          {isSnapshotError ? (
            <Button icon="close" content="Error" color="red" onClick={() => setIsPortalOpen(false)}>
              Error
            </Button>
          ) : (
            <Loader active size="small">
              Loading
            </Loader>
          )}
        </Segment>
      </Portal>
      <Popup
        position="bottom right"
        trigger={<Icon name="angle down" style={{ paddingLeft: 10 }} />}
        on="click"
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        open={isOpen}
        style={{ zIndex: 20 }}
      >
        <Grid textAlign="center" divided columns="equal">
          <Grid.Column>{renderInner()}</Grid.Column>
        </Grid>
      </Popup>
    </>
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
