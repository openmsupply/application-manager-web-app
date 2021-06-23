import React, { useEffect, useState } from 'react'
import { Label, Button, Search, Header, Icon } from 'semantic-ui-react'

import { useRouter } from '../../utils/hooks/useRouter'
import usePageTitle from '../../utils/hooks/usePageTitle'
import useListApplications from '../../utils/hooks/useListApplications'
import strings from '../../utils/constants'
import { findUserRole, checkExistingUserRole } from '../../utils/helpers/list/findUserRole'
import { useUserState } from '../../contexts/UserState'
import mapColumnsByRole from '../../utils/helpers/list/mapColumnsByRole'
import { ApplicationListRow, ColumnDetails, SortQuery } from '../../utils/types'
import { USER_ROLES } from '../../utils/data'
import { Link } from 'react-router-dom'
import ApplicationsList from '../../components/List/ApplicationsList'
import PaginationBar from '../../components/List/Pagination'
import ListFilters from './ListFilters/ListFilters'
import { APPLICATION_FILTERS } from '../../utils/data/applicationFilters'

const ListWrapper: React.FC = () => {
  const { query, updateQuery } = useRouter()
  const { type, userRole } = query
  const {
    userState: { templatePermissions, isNonRegistered, currentUser },
    logout,
  } = useUserState()
  const [columns, setColumns] = useState<ColumnDetails[]>([])
  const [searchText, setSearchText] = useState<string>(query?.search)
  const [sortQuery, setSortQuery] = useState<SortQuery>(getInitialSortQuery(query?.sortBy))
  const [applicationsRows, setApplicationsRows] = useState<ApplicationListRow[]>()
  usePageTitle(strings.PAGE_TITLE_LIST)

  if (isNonRegistered) {
    logout()
    return null
  }

  const { error, loading, applications, applicationCount } = useListApplications(query)

  useEffect(() => {
    if (!templatePermissions) return
    if (!type || !userRole || !checkExistingUserRole(templatePermissions, type, userRole))
      redirectToDefault()
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
    if (searchText !== undefined) updateQuery({ search: searchText })
  }, [searchText])

  useEffect(() => {
    const { sortColumn, sortDirection } = sortQuery
    if (Object.keys(sortQuery).length > 0)
      updateQuery({
        sortBy: sortColumn
          ? `${sortColumn}${sortDirection === 'ascending' ? ':asc' : ''}`
          : undefined,
      })
  }, [sortQuery])

  const redirectToDefault = () => {
    const redirectType = type || Object.keys(templatePermissions)[0]
    const redirectUserRole = checkExistingUserRole(templatePermissions, redirectType, userRole)
      ? userRole
      : findUserRole(templatePermissions, redirectType)
    if (redirectType && redirectUserRole) {
      updateQuery({ type: redirectType, userRole: redirectUserRole }, true)
    } else {
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

  return error ? (
    <Label content={strings.ERROR_APPLICATIONS_LIST} error={error} />
  ) : (
    <div id="list-container">
      <div id="list-top">
        <Header as="h2">{query.type}</Header>
        <Search
          className="flex-grow-1"
          // size="large"
          placeholder={strings.PLACEHOLDER_SEARCH}
          onSearchChange={handleSearchChange}
          input={{ icon: 'search', iconPosition: 'left' }}
          open={false}
          value={searchText}
        />
        {query.userRole === 'applicant' ? (
          <Button as={Link} to={`/application/new?type=${type}`} inverted color="blue">
            <Icon name="plus" size="tiny" color="blue" />
            {strings.BUTTON_APPLICATION_NEW}
          </Button>
        ) : null}
      </div>
      <ListFilters
        filterDefinitions={APPLICATION_FILTERS}
        filterListParameters={{ userId: currentUser?.userId || 0, templateCode: type }}
      />
      {columns && applicationsRows && (
        <ApplicationsList
          columns={columns}
          applications={applicationsRows}
          sortQuery={sortQuery}
          handleSort={handleSort}
          loading={loading}
        />
      )}
      <PaginationBar totalCount={applicationCount} />
    </div>
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
