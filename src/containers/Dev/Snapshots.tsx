import React, { useState, useEffect, useRef } from 'react'
import {
  Button,
  Grid,
  GridColumn,
  Icon,
  Input,
  Label,
  Loader,
  Popup,
  Portal,
  Segment,
} from 'semantic-ui-react'
import config from '../../config'

const snapshotsBaseUrl = `${config.serverREST}/snapshot`
const snapshotListUrl = `${snapshotsBaseUrl}/list`
const takeSnapshotUrl = `${snapshotsBaseUrl}/take`
const useSnapshotUrl = `${snapshotsBaseUrl}/use`
const snapshotFilesUrl = `${snapshotsBaseUrl}/files`
const uploadSnapshotUrl = `${snapshotsBaseUrl}/upload`
// const diffSnapshotUrl = `${snapshotsBaseUrl}/diff`

const Snapshots: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [compareFrom, setCompareFrom] = useState('')
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const [isSnapshotError, setIsSnapshotError] = useState(false)

  const [data, setData] = useState<string[] | null>(null)

  useEffect(() => {
    if (isOpen) {
      setData(null)
      setCompareFrom('')
      setIsSnapshotError(false)
      getList()
    }
  }, [isOpen])

  const getList = async () => {
    try {
      const snapshotListRaw = await fetch(snapshotListUrl, { method: 'GET' })
      const snapshotList: string[] = (await snapshotListRaw.json()).snapshotsNames

      setData(snapshotList)
    } catch (e) {}
  }

  const normaliseSnapshotName = (name: string) =>
    // not word, not digit
    name.replace(/[^\w\d]/g, '')

  const takeSnapshot = async (name: string) => {
    if (!name) return
    setIsOpen(false)
    setIsPortalOpen(true)
    try {
      const resultRaw = await fetch(`${takeSnapshotUrl}?name=${normaliseSnapshotName(name)}`, {
        method: 'POST',
      })
      const resultJson = await resultRaw.json()

      if (resultJson.success) return setIsPortalOpen(false)

      setIsSnapshotError(true)
    } catch (e) {
      setIsSnapshotError(true)
    }
  }

  const useSnapshot = async (name: string) => {
    setIsOpen(false)
    setIsPortalOpen(true)
    try {
      const resultRaw = await fetch(`${useSnapshotUrl}?name=${name}`, {
        method: 'POST',
      })
      const resultJson = await resultRaw.json()

      if (resultJson.success) return setIsPortalOpen(false)

      setIsSnapshotError(true)
    } catch (e) {
      setIsSnapshotError(true)
    }
  }

  const uploadSnapshot = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target?.files) return

    const file = event.target.files[0]
    const snapshotName = normaliseSnapshotName(file.name.replace('.zip', ''))

    setIsOpen(false)
    setIsPortalOpen(true)
    try {
      const data = new FormData()
      data.append('file', file)

      const resultRaw = await fetch(`${uploadSnapshotUrl}?name=${snapshotName}`, {
        method: 'POST',
        body: data,
      })
      const resultJson = await resultRaw.json()

      if (resultJson.success) return setIsPortalOpen(false)
      console.log('setting erro')
      setIsSnapshotError(true)
    } catch (e) {}
  }

  const reanderSnapshotList = () => {
    // const compareLinkRef = useRef<HTMLAnchorElement>(null)
    if (!data) return null
    return (
      <>
        {data.map((snapshotName) => (
          <Grid.Row key={`app_menu_${snapshotName}`}>
            <div>
              <Label>{snapshotName}</Label>

              {compareFrom === '' && (
                <>
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
                  <a href={`${snapshotFilesUrl}/${snapshotName}.zip`} target="_blank">
                    <Icon name="download" />
                  </a>
                  {/* <Icon
                    className="clickable"
                    name="random"
                    onClick={() => setCompareFrom(snapshotName)}
                  /> */}
                </>
              )}
              {/* {compareFrom !== snapshotName && compareFrom !== '' ? (
                <>
                  <a
                    ref={compareLinkRef}
                    href={`${diffSnapshotUrl}?from=${compareFrom}&to=${snapshotName}`}
                    target="_blank"
                    hidden
                  ></a>
                  <Icon
                    className="clickable"
                    name="random"
                    onClick={() => {
                      setIsOpen(false)
                      compareLinkRef?.current?.click()
                    }}
                  />
                </>
              ) : null} */}
            </div>
          </Grid.Row>
        ))}
      </>
    )
  }

  const renderLoadingAndError = () => (
    <Portal open={isPortalOpen}>
      <Segment
        style={{
          left: '40%',
          position: 'fixed',
          top: '50%',
          minWidth: 100,
          minHeight: 100,
          zIndex: 1000,
        }}
      >
        {isSnapshotError ? (
          <Label size="large" color="red">
            Error{' '}
            <Icon
              name="close"
              onClick={() => {
                setIsSnapshotError(false)
                setIsPortalOpen(false)
              }}
            />
          </Label>
        ) : (
          <Loader active size="small">
            Loading
          </Loader>
        )}
      </Segment>
    </Portal>
  )

  const newSnapshot = () => {
    const [value, setValue] = useState('')
    if (compareFrom !== '') return null
    return (
      <Grid.Row key={`app_menu_new-snapshot`}>
        <div>
          <Input
            size="mini"
            onChange={(_, { value }) => setValue(value)}
            placeholder="New Snapshot"
          />
          <Icon className="clickable" name="record" onClick={() => takeSnapshot(value)} />
        </div>
      </Grid.Row>
    )
  }

  const randerUploadSnapshot = () => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    if (compareFrom !== '') return null
    // />
    return (
      <Grid.Row key={`app_menu_upload-snapshot`}>
        <Button size="mini" onClick={() => fileInputRef?.current?.click()}>
          Upload Snapshot {''}
          <Icon name="upload" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".zip"
          hidden
          name="file"
          multiple={false}
          onChange={(e) => uploadSnapshot(e)}
        />
      </Grid.Row>
    )
  }

  return (
    <>
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
          <GridColumn>
            {newSnapshot()}
            {reanderSnapshotList()}
            {randerUploadSnapshot()}
          </GridColumn>
        </Grid>
      </Popup>
      {renderLoadingAndError()}
    </>
  )
}

export default Snapshots
