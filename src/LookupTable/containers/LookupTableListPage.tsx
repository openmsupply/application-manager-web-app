import React from 'react'
import { Container, Divider } from 'semantic-ui-react'
import {
  ListMainMenu as LookUpTableListMainMenu,
  ListTable as LookUpTableListTable,
} from '../components/list'

import { withImportCsvModal } from '../components/hocs'

const LookupTableListPage: React.FC = () => (
  <Container style={{ padding: '2em 0em' }}>
    <LookUpTableListMainMenu
      headerText={'Lookup Tables'}
      subHeaderText={'This page contains the list of all lookup-tables'}
    />
    <Divider />
    <LookUpTableListTable />
  </Container>
)

export default withImportCsvModal(LookupTableListPage)