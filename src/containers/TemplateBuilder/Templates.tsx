import { DateTime } from 'luxon'
import React, { ReactNode, useRef } from 'react'
import { useEffect, useState } from 'react'
import { Button, Header, Icon, Label, Loader, Modal, Table } from 'semantic-ui-react'
import config from '../../config'
import { TemplateStatus, useGetAllTemplatesQuery } from '../../utils/generated/graphql'
import { useRouter } from '../../utils/hooks/useRouter'

type Template = {
  name: string
  status: TemplateStatus
  id: number
  code: string
  category: string
  version: number
  versionTimestamp: DateTime
  applicationCount: number
}
type Templates = {
  main: Template
  applicationCount: number
  numberOfTemplates: number
  all: Template[]
}[]

const useGetTemplates = () => {
  const [templates, setTemplates] = useState<Templates>([])

  const { data, error, refetch } = useGetAllTemplatesQuery({ fetchPolicy: 'network-only' })

  useEffect(() => {
    if (data && !error) {
      const templates: Templates = []

      const templateNodes = data?.templates?.nodes || []
      templateNodes.forEach((template) => {
        if (
          !template?.code ||
          !template.name ||
          !template.status ||
          !template?.version ||
          !template?.versionTimestamp
        ) {
          console.log('failed to load template', template)
          return
        }

        const {
          code,
          name,
          status,
          id,
          version,
          versionTimestamp,
          templateCategory,
          applications,
        } = template
        const holder = templates.find(({ main }) => main.code === code)

        const current = {
          name,
          status,
          id,
          code,
          category: templateCategory?.title || '',
          version,
          versionTimestamp: DateTime.fromISO(versionTimestamp),
          applicationCount: applications.totalCount || 0,
        }

        if (!holder)
          return templates.push({
            main: current,
            applicationCount: current.applicationCount,
            numberOfTemplates: 1,
            all: [current],
          })
        const { main, all } = holder

        all.push(current)
        if (
          status === TemplateStatus.Available ||
          (main.status !== TemplateStatus.Available &&
            main.versionTimestamp < current.versionTimestamp)
        )
          holder.main = current

        holder.applicationCount += current.applicationCount
        holder.numberOfTemplates = all.length
      })

      setTemplates(templates)
    }
  }, [data])

  return {
    error,
    templates,
    refetch,
  }
}

const snapshotsBaseUrl = `${config.serverREST}/snapshot`
const takeSnapshotUrl = `${snapshotsBaseUrl}/take`
const snapshotFilesUrl = `${snapshotsBaseUrl}/files`
const useSnapshotUrl = `${snapshotsBaseUrl}/use`
const templateExportOptionName = 'templateExport'
const uploadSnapshotUrl = `${snapshotsBaseUrl}/upload`

type Error = { message: string; error: string }
type SetError = (error: Error) => void
type SetIsLoading = (value: boolean) => void

type Columns = {
  title: string
  render: (
    template: Template & { numberOfTemplates?: number },
    setError: SetError,
    setIsLoading: SetIsLoading,
    refetch: () => void
  ) => ReactNode
}[]

const columns: Columns = [
  {
    title: '',
    render: ({ code }) => code,
  },
  {
    title: 'name',
    render: ({ name }) => name,
  },

  {
    title: '',
    render: ({ version, versionTimestamp }) => (
      <div className="indicators-container">
        <div key="version" className="indicator">
          <Label className="key" key="key" content="version" />
          <Label className="value" key="value" content={version} />
        </div>
        <div key="versionDate" className="indicator">
          <Label className="key" key="key" content="date" />
          <Label className="value" key="value" content={versionTimestamp.toFormat('dd MMM yy')} />
        </div>
      </div>
    ),
  },
  {
    title: 'category',
    render: ({ category }) => category,
  },
  {
    title: 'status',
    render: ({ status }) => status,
  },
  {
    title: '',
    render: ({ applicationCount, numberOfTemplates }) => (
      <div className="indicators-container">
        <div key="appCount" className="indicator">
          <Label className="key" key="key" content="# application" />
          <Label className="value" key="value" content={applicationCount} />
        </div>

        {numberOfTemplates && (
          <div key="tempCount" className="indicator">
            <Label className="key" key="key" content="# templates" />
            <Label className="value" key="value" content={numberOfTemplates} />
          </div>
        )}
      </div>
    ),
  },

  {
    title: '',
    render: ({ code, version, id }, setError, setIsLoading, refetch) => (
      <div key="buttons">
        <ViewEditButton key="editButton" id={id} />
        <ExportButton
          code={code}
          key="export"
          version={version}
          setError={setError}
          id={id}
          setIsLoading={setIsLoading}
        />
        <DuplicateButton
          code={code}
          key="duplicate"
          version={version}
          setError={setError}
          id={id}
          setIsLoading={setIsLoading}
          refetch={refetch}
        />
      </div>
    ),
  },
]

const ViewEditButton: React.FC<{ id: number }> = ({ id }) => {
  const { push } = useRouter()

  return (
    <div
      key="edit"
      className="clickable"
      onClick={(e) => {
        e.stopPropagation()
        push(`/admin/template/${id}/general`)
      }}
    >
      <Icon name="edit outline" />
    </div>
  )
}

const ExportButton: React.FC<{
  code: string
  version: number
  id: number
  setError: SetError
  setIsLoading: SetIsLoading
}> = ({ code, version, setError, setIsLoading, id }) => {
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)
  const snapshotName = `${code}-${version}`
  const filter = { template: { id: { equalTo: id } } }
  const body = JSON.stringify({ filters: filter })
  return (
    <div key="export">
      <a ref={downloadLinkRef} href={`${snapshotFilesUrl}/${snapshotName}.zip`} target="_blank"></a>
      <div
        className="clickable"
        onClick={async (e) => {
          e.stopPropagation()
          setIsLoading(true)
          try {
            const resultRaw = await fetch(
              `${takeSnapshotUrl}?name=${snapshotName}&optionsName=${templateExportOptionName}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body,
              }
            )
            const resultJson = await resultRaw.json()

            if (resultJson.success) {
              downloadLinkRef?.current?.click()
              return setIsLoading(false)
            }
            setError(resultJson)
          } catch (error) {
            setError({ message: 'Front end error while exporting', error })
          }
        }}
      >
        <Icon className="clickable" key="export" name="sign-out" />
      </div>
    </div>
  )
}

const DuplicateButton: React.FC<{
  code: string
  version: number
  id: number
  setError: SetError
  setIsLoading: SetIsLoading
  refetch: () => void
}> = ({ code, version, setError, setIsLoading, id, refetch }) => {
  const snapshotName = `${code}-${version}`
  const filter = { template: { id: { equalTo: id } } }
  const body = JSON.stringify({ filters: filter })

  return (
    <div key="dupicate">
      <div
        className="clickable"
        onClick={async (e) => {
          e.stopPropagation()
          setIsLoading(true)
          try {
            let resultRaw = await fetch(
              `${takeSnapshotUrl}?name=${snapshotName}&optionsName=${templateExportOptionName}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body,
              }
            )
            let resultJson = await resultRaw.json()

            if (!resultJson.success) return setError(resultJson)

            resultRaw = await fetch(
              `${useSnapshotUrl}?name=${snapshotName}&optionsName=${templateExportOptionName}`,
              {
                method: 'POST',
              }
            )
            resultJson = await resultRaw.json()

            if (!resultJson.success) return setError(resultJson)
            refetch()
            return setIsLoading(false)
          } catch (error) {
            setError({ message: 'Front end error while duplicating', error })
          }
        }}
      >
        <Icon className="clickable" key="export" name="copy" />
      </div>
    </div>
  )
}

const Templates: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { templates, refetch } = useGetTemplates()

  const renderLoadingAndError = () => (
    <Modal open={isLoading} onClick={resetLoading} onClose={resetLoading}>
      {error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Label size="large" color="red">
            {error.message}
            <Icon name="close" onClick={resetLoading} />
          </Label>
          <div style={{ margin: 20 }}>{error.error}</div>
        </div>
      ) : (
        <Loader active>Loading</Loader>
      )}
    </Modal>
  )

  const resetLoading = () => {
    setError(null)
    setIsLoading(false)
  }

  const importTemplate = async (e: any) => {
    if (!e.target?.files) return

    const file = e.target.files[0]
    const snapshotName = file.name.replace('.zip', '')

    setIsLoading(true)
    try {
      const data = new FormData()
      data.append('file', file)

      let resultRaw = await fetch(`${uploadSnapshotUrl}?name=${snapshotName}`, {
        method: 'POST',
        body: data,
      })
      let resultJson = await resultRaw.json()

      if (!resultJson.success) return setError(resultJson)

      resultRaw = await fetch(
        `${useSnapshotUrl}?name=${snapshotName}&optionsName=${templateExportOptionName}`,
        {
          method: 'POST',
        }
      )
      resultJson = await resultRaw.json()

      if (!resultJson.success) return setError(resultJson)
      refetch()
      return setIsLoading(false)
    } catch (error) {
      setError({ message: 'Front end error while importing', error })
    }
  }

  return (
    <div className="template-builder-templates">
      <Header as="h3">Templates / Procedures</Header>

      <div key="topBar" className="topbar">
        <div className="indicators-container">
          <div key="tooltipEdit" className="indicator">
            <Label className="key">
              <Icon name="edit outline" />
            </Label>
            <Label className="value" key="value" content="edit" />
          </div>
          <div key="tooltipExoirt" className="indicator">
            <Label className="key">
              <Icon name="sign-out" />
            </Label>
            <Label className="value" key="value" content="export" />
          </div>
          <div key="tooltipDuplicate" className="indicator">
            <Label className="key">
              <Icon name="copy" />
            </Label>
            <Label className="value" key="value" content="duplicate" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".zip"
            hidden
            name="file"
            multiple={false}
            onChange={importTemplate}
          />
          <Button inverted primary onClick={() => fileInputRef?.current?.click()}>
            Import
          </Button>
        </div>
      </div>

      <div key="listContainer" id="list-container" className="outcome-table-container">
        <Table sortable stackable selectable>
          <Table.Header key="header">
            <Table.Row>
              {columns.map(({ title }, index) => (
                <Table.HeaderCell key={index} colSpan={1}>
                  {title}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body key="body">
            {templates.map(({ main, applicationCount, numberOfTemplates, all }, rowIndex) => {
              return (
                <React.Fragment key={`fragment_${rowIndex}`}>
                  {rowIndex !== selectedRow && (
                    <Table.Row
                      key={`notselected${rowIndex}`}
                      className="clickable"
                      onClick={() => setSelectedRow(rowIndex)}
                    >
                      {columns.map(({ render }, cellIndex) => (
                        <Table.Cell key={`selectedcell${cellIndex}`}>
                          {render(
                            { ...main, applicationCount, numberOfTemplates },
                            setError,
                            setIsLoading,
                            refetch
                          )}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  )}
                  {rowIndex === selectedRow && (
                    <React.Fragment key={`fragment_${rowIndex}`}>
                      <Table.Row
                        key={`selected_${rowIndex}`}
                        className="clickable"
                        onClick={() => setSelectedRow(-1)}
                        style={{
                          height: 10,
                        }}
                      >
                        <td style={{ textAlign: 'center' }} colSpan={columns.length}>
                          <Icon name="angle up" />
                        </td>
                      </Table.Row>
                      {all.map((row, innerRowIndex) => (
                        <Table.Row key={`${rowIndex}_${innerRowIndex}`}>
                          {columns.map(({ render }, cellIndex) => (
                            <Table.Cell key={cellIndex}>
                              {render(row, setError, setIsLoading, refetch)}
                            </Table.Cell>
                          ))}
                        </Table.Row>
                      ))}
                      <Table.Row style={{ height: 2 }} key={`${rowIndex}-end`}>
                        <td colSpan={columns.length}></td>
                      </Table.Row>
                    </React.Fragment>
                  )}
                </React.Fragment>
              )
            })}
          </Table.Body>
        </Table>
      </div>
      {renderLoadingAndError()}
    </div>
  )
}

export default Templates
