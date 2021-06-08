import React from 'react'
import { useQuery } from '@apollo/client'
import { Message, Header, Table } from 'semantic-ui-react'
import { Loading } from '../../components'
import strings from '../../utils/constants'
import { useRouter } from '../../utils/hooks/useRouter'
import { OutcomeDisplay, TableDisplay, TableDisplayQuery } from '../../utils/types'

const OutcomeTable: React.FC<{
  outcomeDisplay: OutcomeDisplay
  tableDisplayColumns: TableDisplay[]
  tableQuery: TableDisplayQuery
  outcomeCode: string
}> = ({ outcomeDisplay, tableDisplayColumns, tableQuery, outcomeCode }) => {
  const { push } = useRouter()
  const { data, error } = useQuery(tableQuery.query, { fetchPolicy: 'network-only' })

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error.message]} />
  if (!data) return <Loading />

  const tableData = tableQuery.getNodes(data)
  const showDetailsForRow = (id: number) => push(`/outcomes/${outcomeCode}/${id}`)

  return (
    <div id="outcomes-display">
      <Header as="h4">{outcomeDisplay.title}</Header>
      <div id="list-container" className="outcome-table-container">
        <Table sortable stackable selectable>
          <Table.Header>
            <Table.Row>
              {tableDisplayColumns.map(({ title }) => (
                <Table.HeaderCell key={title} colSpan={1}>
                  {title}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tableData.map((row: any) => {
              return (
                <Table.Row
                  key={row}
                  className="clickable"
                  onClick={() => showDetailsForRow(row.id)}
                >
                  {tableDisplayColumns.map(({ columnName }) => (
                    <Table.Cell key={columnName}>
                      {getTableValue(row, columnName, row.isTextValue)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

const getTableValue = (
  row: { [columnName: string]: any | string },
  columnName: string,
  isTextValue: boolean
) => {
  const value = row[columnName]
  console.log(row)
  if (!value) return ''
  return isTextValue || typeof value === 'string' ? value : value.text
}

export default OutcomeTable
