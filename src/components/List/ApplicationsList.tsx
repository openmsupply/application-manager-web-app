import React from 'react'
import { Table, Message } from 'semantic-ui-react'
import { ApplicationList } from '../../utils/generated/graphql'
import messages from '../../utils/messages'
import { ColumnDetails, SortQuery } from '../../utils/types'
import Loading from '../Loading'

interface ApplicationsListProps {
  columns: Array<ColumnDetails>
  applications: Array<ApplicationList>
  sortQuery: SortQuery
  handleSort: Function
  loading: boolean
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  columns,
  applications,
  sortQuery: { sortColumn, sortDirection },
  handleSort,
  loading,
}) => {
  return (
    <>
      <Table sortable stackable selectable>
        <Table.Header>
          <Table.Row>
            {columns.map(({ headerName, sortName }) => (
              <Table.HeaderCell
                key={`ApplicationList-header-${headerName}`}
                sorted={sortName && sortColumn === sortName ? sortDirection : undefined}
                onClick={() => handleSort(sortName)}
              >
                {headerName}
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
            applications.map((application, index) => (
              <Table.Row key={`ApplicationList-application-${application.serial}`}>
                {columns.map(({ headerName, ColumnComponent }) => (
                  <Table.Cell key={`ApplicationList-row${index}-${headerName}`}>
                    <ColumnComponent application={application} />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))
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

export default ApplicationsList
