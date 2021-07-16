import React from 'react'
import { NavLink } from 'react-router-dom'
import { Button, Header, Icon } from 'semantic-ui-react'
import { DownloadButton, MainMenu } from '..'
import { useRouter } from '../../../utils/hooks/useRouter'

const LookUpMainMenu: React.FC<any> = (props) => {
  const { tableLabel, tableId } = props
  const {
    match: { path },
  } = useRouter()

  return (
    <MainMenu
      header={
        <Header>
          Lookup Table: {tableLabel}
          <Header.Subheader>View individual lookup-table and its contents</Header.Subheader>
        </Header>
      }
      actions={
        <Button.Group>
          <Button icon as={NavLink} labelPosition="left" to="/admin/lookup-tables">
            <Icon name="arrow alternate circle left" />
            Back
          </Button>
          <Button
            icon
            labelPosition="left"
            as={NavLink}
            color="green"
            to={`/admin/lookup-tables/${tableId}/import`}
          >
            <Icon name="upload" />
            Import
          </Button>
          <DownloadButton
            content="Export"
            labelPosition="left"
            popUpContent={`Download '${tableLabel}' table`}
            id={tableId}
          />
        </Button.Group>
      }
    />
  )
}

export default React.memo(LookUpMainMenu)
