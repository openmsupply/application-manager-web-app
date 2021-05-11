import React, { CSSProperties, useEffect, useState } from 'react'
import {
  Container,
  List,
  Label,
  Segment,
  Button,
  Search,
  Grid,
  Header,
  Image,
  Icon,
  Dropdown,
  Input,
  Checkbox,
} from 'semantic-ui-react'
import { FilterList } from '../../components'
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
import { ReviewerActionCell } from '../../components/List/Cells'

const ListWrapper: React.FC = () => {
  const { query, updateQuery } = useRouter()
  const { type, userRole } = query
  const {
    userState: { templatePermissions, isNonRegistered },
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
      {/* <FilterList /> */}
      {/* <Segment vertical>
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
      <FilterArea />
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

type StaticEnumFilterType = {
  options: { value: string; render?: (removeIcon?: React.ReactNode) => React.ReactNode }[]
}

type SearchableEnumFilterType = {
  search: (value: string) => string[]
}

type FilterType = {
  type: 'strictEnum' | 'searchableEnum' | 'date' | 'boolean'
  title: string
  asStaticEnumFilter: StaticEnumFilterType
  asSearchableEnumFilter: SearchableEnumFilterType
}

const options = [
  {
    value: 'ASSESMENT',
    render: (renderIcon: React.ReactNode) => (
      <Label className="stage-label" style={{ backgroundColor: 'rgb(225, 126, 72)' }}>
        ASSESMENT
        {renderIcon && renderIcon}
      </Label>
    ),
  },
  {
    value: 'SCREENING',
    render: (renderIcon: React.ReactNode) => (
      <Label className="stage-label" style={{ backgroundColor: 'rgb(36, 181, 223)' }}>
        SCREENING
        {renderIcon && renderIcon}
      </Label>
    ),
  },
]

const filters: FilterType[] = [
  {
    type: 'strictEnum',
    title: 'Stage',
    asStaticEnumFilter: {
      options,
    },
    asSearchableEnumFilter: { search: () => [] },
  },
  {
    type: 'strictEnum',
    title: 'Status',
    asStaticEnumFilter: {
      options: [{ value: 'Submitted' }, { value: 'Draft' }, { value: 'Changes Requested' }],
    },
    asSearchableEnumFilter: { search: () => [] },
  },
  {
    type: 'strictEnum',
    title: 'Actions',
    asStaticEnumFilter: {
      options: [{ value: 'Continue' }, { value: 'Self-Assign' }, { value: 'Start' }],
    },
    asSearchableEnumFilter: { search: () => [] },
  },
  {
    type: 'searchableEnum',
    title: 'Reviewer',
    asStaticEnumFilter: {
      options: [],
    },
    asSearchableEnumFilter: {
      search: (value) =>
        [
          'reviewer1',
          'reviewer2',
          'reviewer3',
          'andrei',
          'carl',
          'nicole',
          'chris',
          'craig',
        ].filter((reviewer) => reviewer.match(new RegExp(value, 'g'))),
    },
  },
  {
    type: 'searchableEnum',
    title: 'Assigner',
    asStaticEnumFilter: {
      options: [],
    },
    asSearchableEnumFilter: {
      search: (value) =>
        [
          'reviewer1',
          'reviewer2',
          'reviewer3',
          'andrei',
          'carl',
          'nicole',
          'chris',
          'craig',
        ].filter((reviewer) => reviewer.match(new RegExp(value, 'g'))),
    },
  },
  {
    type: 'date',
    title: 'Last Active',
    asStaticEnumFilter: {
      options: [],
    },
    asSearchableEnumFilter: {
      search: (value) => [],
    },
  },
  {
    type: 'date',
    title: 'First Submission',
    asStaticEnumFilter: {
      options: [],
    },
    asSearchableEnumFilter: {
      search: (value) => [],
    },
  },
  {
    type: 'boolean',
    title: 'Is Fully Assigned',
    asStaticEnumFilter: {
      options: [],
    },
    asSearchableEnumFilter: {
      search: (value) => [],
    },
  },
]

const FilterArea: React.FC = () => {
  const [selectedFilters, setSelectedFilter] = useState<string[]>([])

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
      <Dropdown
        className="user-action clickable"
        as="a"
        color="blue"
        icon="filter"
        text="Add Filter"
      >
        <Dropdown.Menu>
          {filters
            .filter(
              ({ title }) => !selectedFilters.find((selectedFilter) => selectedFilter === title)
            )
            .map(({ title }) => (
              <Dropdown.Item
                key={title}
                onClick={() => {
                  setSelectedFilter([...selectedFilters, title])
                }}
              >
                {title}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>

      {filters
        .filter(({ title }) => selectedFilters.find((selectedFilter) => selectedFilter === title))
        .map((filter) => {
          if (filter.type === 'strictEnum') {
            return (
              <EnumFilter
                key={filter.title}
                title={filter.title}
                enumFilter={filter.asStaticEnumFilter}
                onRemove={() => {
                  setSelectedFilter(
                    selectedFilters.filter((filterTitle) => filterTitle !== filter.title)
                  )
                }}
              />
            )
          }

          if (filter.type === 'searchableEnum') {
            return (
              <SearchableEnumFilter
                key={filter.title}
                title={filter.title}
                searchableFilter={filter.asSearchableEnumFilter}
                onRemove={() => {
                  setSelectedFilter(
                    selectedFilters.filter((filterTitle) => filterTitle !== filter.title)
                  )
                }}
              />
            )
          }
          if (filter.type === 'boolean') {
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 10,
                  marginRight: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 3,
                  }}
                  className="clickable"
                  onClick={() => {
                    setSelectedFilter(
                      selectedFilters.filter((filterTitle) => filterTitle !== filter.title)
                    )
                  }}
                >
                  <div>Is Fully Assigned</div>{' '}
                  <Icon style={{ marginTop: 0, marginBottom: 0 }} name="delete" />
                </div>
                <Checkbox toggle />
              </div>
            )
          }
          if (filter.type === 'date') {
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 10,
                  marginRight: 10,
                }}
              >
                <Dropdown text={filter.title} style={{ fontWeight: 'none' }} inline>
                  <Dropdown.Menu>
                    <Dropdown.Header
                      className="clickable"
                      onClick={() => {
                        setSelectedFilter(
                          selectedFilters.filter((filterTitle) => filterTitle !== filter.title)
                        )
                      }}
                    >
                      REMOVE FILTER
                      <Icon name="delete" />{' '}
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item>
                      <Dropdown text="Select from Calendar" icon="calendar outline">
                        <Dropdown.Menu>
                          <Dropdown.Header>
                            <Image src="/images/datepicker.png" />
                          </Dropdown.Header>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item>Last Week</Dropdown.Item>
                    <Dropdown.Item>Older Then Last Week</Dropdown.Item>
                    <Dropdown.Item>More Then Two Weeks Old</Dropdown.Item>
                    <Dropdown.Item>More Then Three Weeks Old</Dropdown.Item>
                    <Dropdown.Item>More Then a Month Ago</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )
          }

          return null
        })}
    </div>
  )
}

const EnumFilter: React.FC<{
  title: string
  onRemove: () => void
  enumFilter: StaticEnumFilterType
}> = ({ enumFilter, title, onRemove }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const options = enumFilter.options
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
      }}
    >
      <Dropdown text={title} style={{ fontWeight: 'none' }} inline>
        <Dropdown.Menu>
          <Dropdown.Header className="clickable" onClick={onRemove}>
            REMOVE FILTER
            <Icon name="delete" />{' '}
          </Dropdown.Header>
          <Dropdown.Divider />
          {options
            .filter((option) => !selectedOptions.find((_option) => _option === option.value))
            .map((option) => (
              <Dropdown.Item
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedOptions([...selectedOptions, option.value])
                }}
              >
                {option.render && option.render()}
                {!option.render && option.value}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>
      {selectedOptions.length > 0 && (
        <div
          style={{
            marginLeft: 3,
            marginRight: 3,
            padding: 5,
            paddingLeft: 3,
            paddingRight: 10,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            background: 'white',
            flexWrap: 'wrap',
            border: '1px solid rgba(34, 36, 38, 0.15)',
            borderRadius: 6,
            color: 'rgba(0, 0, 0, 0.87',
          }}
        >
          {options
            .filter((option) => selectedOptions.find((_option) => _option === option.value))
            .map((option) => (
              <div
                key={option.value}
                className="clickable"
                style={{ marginLeft: 5, marginRight: 5 }}
                onClick={() => {
                  setSelectedOptions(selectedOptions.filter((_option) => _option !== option.value))
                }}
              >
                {option.render && option.render(<Icon name="delete" />)}
                {!option.render && (
                  <>
                    {option.value}
                    <Icon name="delete" />
                  </>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

const SearchableEnumFilter: React.FC<{
  title: string
  onRemove: () => void
  searchableFilter: SearchableEnumFilterType
}> = ({ searchableFilter, title, onRemove }) => {
  const [options, setOptions] = useState<string[]>([])
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
      }}
    >
      <Dropdown direction="left" text={title} style={{ fontWeight: 'none' }} inline>
        <Dropdown.Menu>
          <Dropdown.Header className="clickable" onClick={onRemove}>
            REMOVE FILTER
            <Icon name="delete" />{' '}
          </Dropdown.Header>
          <Dropdown.Divider />
          <Input
            icon="search"
            iconPosition="left"
            className="search"
            onClick={(e: any) => e.stopPropagation()}
            onChange={(_, { value }) => {
              setOptions(
                searchableFilter
                  .search(value)
                  .filter((_value) => !selectedOptions.find((selected) => selected === value))
              )
            }}
          />
          <Dropdown.Divider />
          {options
            .filter((option) => !selectedOptions.find((_option) => _option === option))
            .map((option) => (
              <Dropdown.Item
                key={option}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedOptions([...selectedOptions, option])
                }}
              >
                {option}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>
      {selectedOptions.length > 0 && (
        <div
          style={{
            padding: 5,
            marginLeft: 3,
            paddingRight: 3,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            background: 'white',
            flexWrap: 'wrap',
            justifyContent: 'center',
            border: '1px solid rgba(34, 36, 38, 0.15)',
            borderRadius: 6,
            maxWidth: 300,
            color: 'rgba(0, 0, 0, 0.87',
          }}
        >
          {selectedOptions.map((option) => (
            <div
              key={option}
              style={{ marginLeft: 5, marginRight: 5 }}
              className="clickable"
              onClick={() => {
                setSelectedOptions(selectedOptions.filter((_option) => _option !== option))
              }}
            >
              {option}
              <Icon name="delete" />
            </div>
          ))}
        </div>
      )}
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
