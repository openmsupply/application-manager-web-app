import React from 'react'
import { NavLink } from 'react-router-dom'
import { Button, Header, Icon, Message, Popup, Table } from 'semantic-ui-react'
import { Loading } from '../../../components'
import { FieldMapType, LookUpTableType } from '../../types'
import { DownloadButton } from '..'

const TABLE_PREFIX = 'lookup_table_'

const ListTable: React.FC<any> = ({
  allTableStructures,
  allTableStructuresLoadState,
  setAllTableStructures,
}: any) => {
  const { loading, error } = allTableStructuresLoadState

  const handleExpansion = (lookupTable: LookUpTableType) => {
    if (!lookupTable) return
    lookupTable.isExpanded = !lookupTable.isExpanded
    setAllTableStructures(allTableStructures)
  }

  return error ? (
    <Message error header={'Error loading lookup-table'} list={[error.message]} />
  ) : loading || !allTableStructures ? (
    <Loading />
  ) : (
    <Table sortable stackable selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell key={`lookup-table-header-title`} colSpan={1}>
            Label
          </Table.HeaderCell>
          <Table.HeaderCell key={`lookup-table-header-table-name`} colSpan={1}>
            Table Name
          </Table.HeaderCell>
          <Table.HeaderCell key={`lookup-table-header-actions`} colSpan={2}>
            Actions
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {allTableStructures.length > 0 ? (
          (allTableStructures as LookUpTableType[]).map((lookupTable: LookUpTableType) => (
            <React.Fragment key={`lookup-table-a-${lookupTable.id}`}>
              <Table.Row
                key={`lookup-table-${lookupTable.id}`}
                onClick={() => handleExpansion(lookupTable)}
              >
                <Table.Cell>{lookupTable.label}</Table.Cell>
                <Table.Cell>{TABLE_PREFIX + lookupTable.name}</Table.Cell>
                <Table.Cell collapsing>
                  <Button.Group>
                    <Popup
                      content="View lookup table"
                      trigger={
                        <Button icon as={NavLink} to={'/lookup-tables/' + lookupTable.id}>
                          <Icon name="eye" />
                        </Button>
                      }
                    />
                    <Popup
                      content="Import lookup table"
                      trigger={
                        <Button
                          icon
                          as={NavLink}
                          to={'/lookup-tables/' + lookupTable.id + '/import'}
                        >
                          <Icon name="upload" />
                        </Button>
                      }
                    />
                    <DownloadButton
                      popUpContent={`Download '${lookupTable.label}' table`}
                      id={lookupTable.id}
                    />
                  </Button.Group>
                </Table.Cell>
                <Table.Cell icon="chevron down" collapsing />
              </Table.Row>
              {lookupTable.isExpanded && (
                <Table.Row key={`table_row_detail_${lookupTable.id}`}>
                  <Table.Cell colSpan="4">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Database Field-name</Table.HeaderCell>
                          <Table.HeaderCell>Lookup-table Label</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {lookupTable.fieldMap.map((field: FieldMapType) => (
                          <Table.Row
                            key={`lookup-table-${lookupTable.id}-fieldMap-${field.fieldname}`}
                          >
                            <Table.Cell>{field.fieldname}</Table.Cell>
                            <Table.Cell>{field.label}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </Table.Cell>
                </Table.Row>
              )}
            </React.Fragment>
          ))
        ) : (
          <Table.Row>
            <Table.Cell colSpan="4">
              <Header as="h5" icon="exclamation circle" content="No lookup-table found!" />
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )
}

export default ListTable
