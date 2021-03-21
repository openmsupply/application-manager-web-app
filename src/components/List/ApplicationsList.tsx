import { pseudoRandomBytes } from 'crypto'
import React, { Fragment } from 'react'
import { Table, Message, Segment } from 'semantic-ui-react'
import { useRouter } from '../../utils/hooks/useRouter'
import messages from '../../utils/messages'
import { ApplicationListRow, ColumnDetails, SortQuery } from '../../utils/types'
import Loading from '../Loading'

interface ApplicationsListProps {
  columns: Array<ColumnDetails>
  applications: ApplicationListRow[]
  sortQuery: SortQuery
  handleSort: Function
  handleExpansion: (row: ApplicationListRow) => void
  loading: boolean
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  columns,
  applications,
  sortQuery: { sortColumn, sortDirection },
  handleSort,
  handleExpansion,
  loading,
}) => {
  return (
    <>
      <Table sortable stackable selectable>
        <Table.Header>
          <Table.Row>
            {columns.map(({ headerName, sortName }, index) => (
              <Table.HeaderCell
                key={`ApplicationList-header-${headerName}-${index}`}
                sorted={sortName && sortColumn === sortName ? sortDirection : undefined}
                onClick={() => handleSort(sortName)}
                colSpan={index === columns.length - 1 ? 2 : 1} // Set last column to fill last column (expansion)
              >
                <p>{headerName}</p>
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Row colSpan={columns.length} textAlign="center">
              <Table.Cell colSpan={columns.length} textAlign="center">
                <Loading />
              </Table.Cell>
            </Table.Row>
          ) : (
            applications.map((application, index) => {
              const { isExpanded } = application
              const rowProps = {
                index,
                columns,
                application,
                handleExpansion,
              }
              const sectionsProps = {
                index,
                application,
                colSpan: columns.length + 1,
              }
              return (
                <Fragment key={`ApplicationList-application-${index}`}>
                  <ApplicationRow {...rowProps} />
                  {isExpanded && <SectionsExpandedRow {...sectionsProps} />}
                </Fragment>
              )
            })
          )}
        </Table.Body>
      </Table>
      {loading && <Loading />}
      {applications && applications.length === 0 && (
        <Message floating color="yellow" header={messages.APPLICATIONS_LIST_EMPTY} />
      )}
    </>
  )
}

interface ApplicationRowProps {
  index: number
  columns: Array<ColumnDetails>
  application: ApplicationListRow
  handleExpansion: (row: ApplicationListRow) => void
}

const ApplicationRow: React.FC<ApplicationRowProps> = ({
  index,
  columns,
  application,
  handleExpansion,
}) => {
  const { push, query } = useRouter()

  return (
    <Table.Row
      key={`ApplicationList-application-${application.id}`}
      onClick={() => {
        console.log(query)
        if (query.userRole === 'applicant') push(`/application/${application.serial}`)
        else push(`/application/${application.serial}/review`)
      }}
    >
      {columns.map(({ headerName, ColumnComponent }, index) => (
        <Table.Cell key={`ApplicationList-row-${application.id}-${index}`}>
          <ColumnComponent application={application} />
        </Table.Cell>
      ))}
      <Table.Cell icon="angle right" collapsing />
    </Table.Row>
  )
}

interface SectionsExpandedRowProps {
  application: ApplicationListRow
  index: number
  colSpan: number
}

const SectionsExpandedRow: React.FC<SectionsExpandedRowProps> = ({
  application,
  index,
  colSpan,
}) => {
  const { serial } = application
  return (
    <Table.Row key={`ApplicationList-application-${application.id}-sections`} colSpan={colSpan}>
      <Table.Cell colSpan={colSpan}>
        <Segment color="grey">TODO: SECTIONS</Segment>
      </Table.Cell>
    </Table.Row>
  )
}

export default ApplicationsList
