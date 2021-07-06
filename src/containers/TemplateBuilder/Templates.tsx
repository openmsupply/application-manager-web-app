import React, { ReactNode, useRef } from 'react'
import { useState } from 'react'
import { Button, Header, Icon, Table } from 'semantic-ui-react'
import { useRouter } from '../../utils/hooks/useRouter'
import { TextIO } from './shared/components'
import OperationContext, { snapshotFilesUrl, useOperationState } from './shared/OperationContext'
import useGetTemplates, { Template } from './useGetTemplates'

type CellPropsTemplate = Template & { numberOfTemplates?: number }
type CellProps = { template: CellPropsTemplate; refetch: () => void }

type Columns = {
  title: string
  render: (props: CellProps) => ReactNode
}[]

const columns: Columns = [
  {
    title: '',
    render: ({ template: { code } }) => code,
  },
  {
    title: 'name',
    render: ({ template: { name } }) => name,
  },

  {
    title: '',
    render: ({ template: { version, versionTimestamp } }) => (
      <React.Fragment key="version">
        <TextIO text={String(version)} title="version" />
        <TextIO text={String(versionTimestamp.toFormat('dd MMM yy'))} title="date" />
      </React.Fragment>
    ),
  },
  {
    title: 'category',
    render: ({ template: { category } }) => category,
  },
  {
    title: 'status',
    render: ({ template: { status } }) => status,
  },
  {
    title: '',
    render: ({ template: { applicationCount, numberOfTemplates } }) => (
      <React.Fragment key="counts">
        <TextIO text={String(applicationCount)} title="# application" />
        {numberOfTemplates && <TextIO text={String(numberOfTemplates)} title="# templates" />}
      </React.Fragment>
    ),
  },

  {
    title: '',
    render: (cellProps) => (
      <div key="buttons">
        <ViewEditButton {...cellProps} />
        <ExportButton {...cellProps} />
        <DuplicateButton {...cellProps} />
      </div>
    ),
  },
]

const ViewEditButton: React.FC<CellProps> = ({ template: { id } }) => {
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

const ExportButton: React.FC<CellProps> = ({ template: { code, version, id } }) => {
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)
  const { exportTemplate } = useOperationState()
  const snapshotName = `${code}-${version}`

  return (
    <div key="export">
      <a ref={downloadLinkRef} href={`${snapshotFilesUrl}/${snapshotName}.zip`} target="_blank"></a>
      <div
        className="clickable"
        onClick={async (e) => {
          e.stopPropagation()
          if (await exportTemplate({ id, snapshotName })) downloadLinkRef?.current?.click()
        }}
      >
        <Icon className="clickable" key="export" name="sign-out" />
      </div>
    </div>
  )
}

const DuplicateButton: React.FC<CellProps> = ({ template: { code, version, id }, refetch }) => {
  const snapshotName = `${code}-${version}`
  const { duplicateTemplate } = useOperationState()

  return (
    <div key="duplicate">
      <div
        className="clickable"
        onClick={async (e) => {
          e.stopPropagation()
          if (await duplicateTemplate({ id, snapshotName })) refetch()
        }}
      >
        <Icon className="clickable" key="export" name="copy" />
      </div>
    </div>
  )
}

const TemplatesWrapper: React.FC = () => (
  <OperationContext>
    <Templates />
  </OperationContext>
)

const Templates: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState(-1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { templates, refetch } = useGetTemplates()
  const { importTemplate } = useOperationState()

  const renderHeader = () => (
    <Table.Header key="header">
      <Table.Row>
        {columns.map(({ title }, index) => (
          <Table.HeaderCell key={index} colSpan={1}>
            {title}
          </Table.HeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
  )

  const renderTemplate = (
    template: CellPropsTemplate,
    refetch: () => void,
    rowIndex: number,
    isInnerRender = false
  ) => {
    if (rowIndex === selectedRow && !isInnerRender) return null

    return (
      <Table.Row
        key={`notselected${rowIndex}`}
        className="clickable"
        onClick={() => setSelectedRow(rowIndex)}
      >
        {columns.map(({ render }, cellIndex) => (
          <Table.Cell key={`selectedcell${cellIndex}`}>{render({ template, refetch })}</Table.Cell>
        ))}
      </Table.Row>
    )
  }

  const renderInnerTemplates = (all: Template[], refetch: () => void, rowIndex: number) => {
    if (rowIndex !== selectedRow) return null
    return (
      <>
        <Table.Row
          key={`selected_${rowIndex}`}
          className="clickable collapsed-start-row"
          onClick={() => setSelectedRow(-1)}
        >
          <td colSpan={columns.length}>
            <Icon name="angle up" />
          </td>
        </Table.Row>
        {all.map((template, innerRowIndex) =>
          renderTemplate(template, refetch, innerRowIndex, true)
        )}
        <Table.Row className="collapsed-end-row" key={`${rowIndex}-end`}>
          <td colSpan={columns.length}></td>
        </Table.Row>
      </>
    )
  }

  const renderImportButton = () => (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".zip"
        hidden
        name="file"
        multiple={false}
        onChange={async (e) => {
          if (await importTemplate(e)) refetch()
        }}
      />
      <Button inverted primary onClick={() => fileInputRef?.current?.click()}>
        Import
      </Button>
    </>
  )

  return (
    <div className="template-builder-templates">
      <div key="top-bar" className="top-bar">
        <Header as="h3">Templates / Procedures</Header>

        <div className="flex-grow-1" />
        <TextIO icon="edit" text="edit" />
        <TextIO icon="sign-out" text="export" />
        <TextIO icon="copy" text="duplicate" />
        {renderImportButton()}
      </div>

      <div key="listContainer" id="list-container" className="outcome-table-container">
        <Table sortable stackable selectable>
          {renderHeader()}
          <Table.Body key="body">
            {templates.map(({ all, main, applicationCount, numberOfTemplates }, rowIndex) => (
              <React.Fragment key={`fragment_${rowIndex}`}>
                {renderTemplate(
                  { ...main, applicationCount, numberOfTemplates },
                  refetch,
                  rowIndex
                )}
                {renderInnerTemplates(all, refetch, rowIndex)}
              </React.Fragment>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default TemplatesWrapper
