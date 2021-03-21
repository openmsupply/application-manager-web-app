import React, { useEffect, useState } from 'react'
import { Container, List, Label, Segment, Button, Search, Header } from 'semantic-ui-react'
import { useRouter } from '../../utils/hooks/useRouter'
import useListApplications from '../../utils/hooks/useListApplications'
import strings from '../../utils/constants'
import getDefaultUserRole from '../../utils/helpers/list/findUserRole'
import { useUserState } from '../../contexts/UserState'
import mapColumnsByRole from '../../utils/helpers/list/mapColumnsByRole'
import { ApplicationListRow, ColumnDetails, SortQuery } from '../../utils/types'
import { USER_ROLES } from '../../utils/data'
import { Link } from 'react-router-dom'
import ApplicationsList from '../../components/List/ApplicationsList'
import PaginationBar from '../../components/List/Pagination'

const ListWrapper: React.FC = () => {
  const { query, updateQuery } = useRouter()
  const { type, userRole } = query
  const {
    userState: { templatePermissions },
  } = useUserState()
  const [columns, setColumns] = useState<ColumnDetails[]>([])
  const [searchText, setSearchText] = useState<string>(query?.search)
  const [sortQuery, setSortQuery] = useState<SortQuery>(getInitialSortQuery(query?.sortBy))
  const [applicationsRows, setApplicationsRows] = useState<ApplicationListRow[]>()

  const { error, loading, applications, applicationCount } = useListApplications(query)

  useEffect(() => {
    if (!templatePermissions) return
    if (!type || !userRole) redirectToDefault()
    else {
      const columns = mapColumnsByRole(userRole as USER_ROLES)
      setColumns(columns)
    }
  }, [query, templatePermissions])

  useEffect(() => {
    if (!loading && applications) {
      setApplicationsRows(
        applications.map((application) => ({ ...application, isExpanded: false }))
      )
    }
  }, [loading, applications])

  useEffect(() => {
    updateQuery({ search: searchText })
  }, [searchText])

  useEffect(() => {
    const { sortColumn, sortDirection } = sortQuery
    updateQuery({
      sortBy: sortColumn
        ? `${sortColumn}${sortDirection === 'ascending' ? ':asc' : ''}`
        : undefined,
    })
  }, [sortQuery])

  const redirectToDefault = () => {
    const redirectType = type || Object.keys(templatePermissions)[0]
    const redirectUserRole = userRole || getDefaultUserRole(templatePermissions, redirectType)
    if (redirectType && redirectUserRole)
      updateQuery({ type: redirectType, userRole: redirectUserRole })
    else {
      // To-Do: Show 404 if no default found
    }
  }

  const handleSearchChange = (e: any) => {
    setSearchText(e.target.value)
  }

  const handleSort = (sortName: string) => {
    const { sortColumn, sortDirection } = sortQuery
    switch (true) {
      case sortName === sortColumn && sortDirection === 'descending':
        setSortQuery({ sortColumn: sortName, sortDirection: 'ascending' })
        break
      case sortName === sortColumn && sortDirection === 'ascending':
        setSortQuery({})
        break
      default:
        // Clicked on a new column
        setSortQuery({ sortColumn: sortName, sortDirection: 'descending' })
        break
    }
  }

  const handleExpansion = (application: ApplicationListRow) => {
    if (!applicationsRows) return
    application.isExpanded = !application.isExpanded // updates in place inside applicationRows
    setApplicationsRows([...applicationsRows]) // triggers re-render
  }

  return error ? (
    <Label content={strings.ERROR_APPLICATIONS_LIST} error={error} />
  ) : (
    <Container style={{ paddingTop: 40 }}>
      {/* <FilterList />
      <Segment vertical>
        {Object.keys(query).length > 0 && <h3>Query parameters:</h3>}
        <List>
          {Object.entries(query).map(([key, value]) => (
            <List.Item key={`ApplicationList-parameter-${value}`} content={key + ' : ' + value} />
          ))}
        </List>
        <Grid columns={3} style={{ marginTop: '5px' }}>
          <Grid.Row>
            <Grid.Column width={3}>
              <Search
                // size="large"
                placeholder={strings.PLACEHOLDER_SEARCH}
                onSearchChange={handleSearchChange}
                open={false}
                input={{
                  icon: 'search',
                  iconPosition: 'left',
                }}
                value={searchText}
              />
            </Grid.Column>
            <Grid.Column textAlign="left" verticalAlign="middle">
              <Button content={strings.BUTTON_CLEAR_SEARCH} onClick={() => setSearchText('')} />
            </Grid.Column>
            <Grid.Column textAlign="right" verticalAlign="middle" floated="right">
              <Button
                as={Link}
                to={`/application/new?type=${type}`}
                content={strings.BUTTON_APPLICATION_NEW}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment> */}

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Header as="h2" style={{ letterSpacing: 1, fontWeight: 400, margin: 0 }}>
          {query.type}
        </Header>
        <Search
          // size="large"
          style={{ flexGrow: 1, marginLeft: 30 }}
          placeholder={strings.PLACEHOLDER_SEARCH}
          onSearchChange={handleSearchChange}
          input={{ icon: 'search', iconPosition: 'left' }}
          open={false}
          value={searchText}
        />
        {query.userRole === 'applicant' ? (
          <Button
            style={{
              background: 'none',
              color: '#003BFE',
              letterSpacing: 1.4,
              border: '2px solid #003BFE',
              borderRadius: 8,
              textTransform: 'capitalize',
            }}
            as={Link}
            to={`/application/new?type=${type}`}
            content={strings.BUTTON_APPLICATION_NEW}
          />
        ) : null}
      </div>

      {columns && applicationsRows && (
        <ApplicationsList
          columns={columns}
          applications={applicationsRows}
          sortQuery={sortQuery}
          handleSort={handleSort}
          handleExpansion={handleExpansion}
          loading={loading}
        />
      )}
      <PaginationBar totalCount={applicationCount} />
    </Container>
  )
}

export default ListWrapper

const getInitialSortQuery = (query: string): SortQuery => {
  if (!query) return {}
  const [sortColumn, direction] = query.split(':')
  return {
    sortColumn,
    sortDirection: direction === 'asc' ? 'ascending' : 'descending',
  }
}
