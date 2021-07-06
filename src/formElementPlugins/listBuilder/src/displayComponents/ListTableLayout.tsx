import React from 'react'
import { Table, TableHeaderCell, TableCell } from 'semantic-ui-react'
import { ListLayoutProps } from '../types'

const ListTableLayout: React.FC<ListLayoutProps> = ({
  listItems,
  fieldTitles = [],
  codes = [],
  editItem = () => {},
  // deleteItem = () => {},
  isEditable = true,
}) => {
  return (
    <Table celled selectable={isEditable}>
      <Table.Header>
        <Table.Row>
          {fieldTitles.map((title) => (
            <TableHeaderCell key={`list-header-field-${title}`}>{title}</TableHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {listItems.map((item, index) => (
          <Table.Row key={`list-row-${index}`} onClick={() => editItem(index)}>
            {codes.map((code, cellIndex) => (
              <TableCell key={`list-cell-${index}-${cellIndex}`}>
                {item[code]?.value?.text}
              </TableCell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default ListTableLayout
