import { toPromise } from '@apollo/client'
import React from 'react'
import { Link } from 'react-router-dom'
import {
  Label,
  Header,
  List,
  Card,
  Segment,
  Grid,
  Divider,
  Button,
  Icon,
  Popup,
} from 'semantic-ui-react'
import { useUserState } from '../contexts/UserState'
import useListTemplates from '../utils/hooks/useListTemplates'
import useListApplications from '../utils/hooks/useListApplications'

const roleList = [
  {
    tooltip: 'Can Apply',
    icon: 'edit',
    role: 'Apply',
  },
  {
    tooltip: 'Can Review',
    icon: 'gavel',
    role: 'Review',
  },
  {
    tooltip: 'Can Assign',
    icon: 'user plus',
    role: 'Assign',
  },
]

const Roles: React.FC = (props: any) => (
  <Label
    floating
    style={{
      left: 'auto',
      right: 0,
      background: 'none',
      top: '-1em',
      margin: 0,
      padding: 0,
    }}
  >
    {roleList.map((roleInfo) => {
      if (!props.roles.find((roleName: any) => roleName === roleInfo.role)) return null
      return (
        <Popup
          content={roleInfo.tooltip}
          trigger={
            <Icon
              name={roleInfo.icon}
              circular
              style={{ background: 'white', padding: 2, margin: 2, color: 'rgb(120, 120, 120)' }}
            />
          }
        />
      )
    })}
  </Label>
)

const SingleFilter: React.FC = (props: any) => {
  console.log(props)
  console.log({
    type: props.templateType,
    ...props.filter.query,
  })

  const { loading, applications } = useListApplications({
    type: props.templateType,
    ...props.filter.query,
  })

  if (loading) return null
  if (applications.length === 0) return null
  return (
    <div style={{ color: props.filter.color, display: 'flex', margin: 2 }}>
      <Icon name={props.filter.icon} />

      <Link
        style={{ color: '#003BFE', fontWeight: 300 }}
        to={`/applications?type=${props.templateType}&${Object.entries(props.filter.query)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')}`}
      >{`${applications.length} ${props.filter.title}`}</Link>
    </div>
  )
}

const FilterList: React.FC = (props: any) => {
  const filters = (props.filteredTemplate?.templateFilterJoins?.nodes || [])
    .map((node: any) => node.templateFilter)
    .filter((templateFiler: any) => {
      console.log({ role: templateFiler.userRole, permissions: props.filteredTemplate.permissions })
      return props.filteredTemplate.permissions.find((type: any) => type === templateFiler.userRole)
    })
  // Filter by permission set
  console.log({
    filters,
    nodes: props.filteredTemplate?.templateFilterJoins?.nodes,
    joins: props,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 5 }}>
      {filters.map((filter: any) => (
        <SingleFilter filter={filter} templateType={props.filteredTemplate.code} />
      ))}
      {/* <List.Item>
        <List.Icon name="tag" />
        <List.Content>
          <a href="mailto:jack@semantic-ui.com">{`${applications.length} Draft`}</a>
        </List.Content>
      </List.Item>
      <List.Item>
        <List.Icon name="reply" />
        <List.Content>
          <a href="http://www.semantic-ui.com">1 Changes Requested</a>
        </List.Content>
      </List.Item> */}
    </div>
  )
}

const Home: React.FC = () => {
  const {
    userState: { currentUser, isLoading, templatePermissions },
  } = useUserState()
  console.log('HERE')
  const { error, loading, filteredTemplates } = useListTemplates(templatePermissions, isLoading)

  console.log(filteredTemplates)
  console.log('HERE')

  if (loading) return <Label>loading</Label>

  const templateCategories: any = {}
  filteredTemplates.forEach(({ templateCategory }) => {
    if (!templateCategory) templateCategories['General'] = { title: 'General', icon: 'globe' }
    else templateCategories[templateCategory.code] = templateCategory
  })

  return (
    <div
      style={{ margin: 0, flexDirection: 'row', display: 'flex', justifyContent: 'space-evenly' }}
    >
      {Object.values(templateCategories).map((templateCategory: any) => {
        return (
          <Card.Group
            centered
            style={{ 'justify-content': 'space-evenly', margin: 0, 'align-items': 'start' }}
          >
            <Card
              style={{
                maxWidth: 600,
                width: 'auto',
                background: 'none',
                border: 'none',
                boxShadow: 'none',
              }}
            >
              <Card.Content>
                <Card.Header textAlign="center">
                  <Header
                    as="h2"
                    style={{ color: 'rgb(120, 120,120', fontSize: 15, textTransform: 'uppercase' }}
                  >
                    <Icon name={templateCategory.icon} />
                    {templateCategory.title}
                  </Header>
                </Card.Header>

                <Card.Description>
                  <Card.Group
                    centered
                    style={{ margin: 0, 'justify-content': 'center', 'align-items': 'start' }}
                  >
                    {filteredTemplates
                      .filter(
                        ({ templateCategory: tP }) =>
                          (!tP && templateCategory.title === 'General') ||
                          tP?.title === templateCategory.title
                      )
                      .map((filteredTemplate) => {
                        return (
                          <Card style={{ width: 'auto' }}>
                            <Roles roles={filteredTemplate.permissions} />

                            <Card.Content style={{ 'align-items': 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Header
                                    as="h3"
                                    style={{ padding: 0, margin: 0, fontSize: 15, fontWeight: 600 }}
                                  >
                                    {filteredTemplate.name}
                                  </Header>
                                </div>

                                {!filteredTemplate.permissions.find(
                                  (type) => type === 'Apply'
                                ) ? null : (
                                  <Button
                                    style={{
                                      background: 'none',
                                      color: '#003BFE',
                                      letterSpacing: 1.4,
                                      border: '2px solid #003BFE',
                                      borderRadius: 8,
                                      fontSize: 12,
                                      padding: 10,
                                      fontWeight: 600,
                                      paddingTop: 7,
                                      marginLeft: 20,
                                      paddingBottom: 7,
                                      textTransform: 'capitalize',
                                    }}
                                    as={Link}
                                    to={`/application/new?type=${filteredTemplate.code}`}
                                    content=" + New"
                                  />
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  marginTop: 20,
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                }}
                              >
                                <FilterList filteredTemplate={filteredTemplate} />
                                <Link
                                  style={{
                                    fontSize: 10,
                                    color: '#003BFE',
                                    letterSpacing: 1,
                                  }}
                                  to={`/applications?type=${filteredTemplate.code}`}
                                >
                                  VIEW ALL
                                </Link>
                              </div>
                            </Card.Content>
                          </Card>
                        )
                      })}
                  </Card.Group>
                </Card.Description>
              </Card.Content>
            </Card>
          </Card.Group>
        )
      })}
      {/* <Card.Group
        centered
        style={{ 'justify-content': 'space-evenly', margin: 0, 'align-items': 'start' }}
      >
        <Card style={{ 'max-width': 600, width: 'auto' }}>
          <Card.Content>
            <Card.Header textAlign="center">
              <Header as="h2">
                <Icon name="vcard" />
                Organisations
              </Header>
            </Card.Header>

            <Card.Description>
              <Card.Group
                centered
                style={{ margin: 0, 'justify-content': 'center', 'align-items': 'start' }}
              >
                <Card style={{ width: 'auto' }}>
                  <Card.Content style={{ 'align-items': 'center' }}>
                    <Header as="h3">Join Organisation</Header>
                    Apply to join existing Organisation
                  </Card.Content>
                  <Card.Content
                    extra
                    style={{
                      'justify-content': 'center',
                      display: 'flex',
                      'flex-direction': 'row',
                    }}
                  >
                    <Button animated>
                      <Button.Content visible>
                        <Icon size="large" name="add square" />
                      </Button.Content>
                      <Button.Content hidden>Apply</Button.Content>
                    </Button>
                    <Button animated>
                      <Button.Content visible>
                        <Icon size="large" name="list alternate" />
                      </Button.Content>
                      <Button.Content hidden>List</Button.Content>
                    </Button>
                  </Card.Content>
                  <Card.Content extra>
                    <List>
                      <List.Item>
                        <List.Icon name="tag" />
                        <List.Content>
                          <a href="mailto:jack@semantic-ui.com">5 Awaiting Review</a>
                        </List.Content>
                      </List.Item>
                      <List.Item>
                        <List.Icon name="reply" />
                        <List.Content>
                          <a href="http://www.semantic-ui.com">1 Changes Requested</a>
                        </List.Content>
                      </List.Item>
                    </List>
                  </Card.Content>
                </Card>
                <Card style={{ width: 'auto' }}>
                  <Card.Content>
                    <Header as="h3">Create organisation</Header>
                    Apply to register new organisation
                  </Card.Content>
                  <Card.Content
                    extra
                    style={{
                      'justify-content': 'center',
                      display: 'flex',
                      'flex-direction': 'row',
                    }}
                  >
                    <Button animated>
                      <Button.Content visible>
                        <Icon size="large" name="add square" />
                      </Button.Content>
                      <Button.Content hidden>Apply</Button.Content>
                    </Button>
                    <Button animated>
                      <Button.Content visible>
                        <Icon size="large" name="list alternate" />
                      </Button.Content>
                      <Button.Content hidden>List</Button.Content>
                    </Button>
                  </Card.Content>
                </Card>
              </Card.Group>
            </Card.Description>
          </Card.Content>
        </Card>

        <Card style={{ 'max-width': 600, width: 'auto' }}>
          <Card.Content>
            <Card.Header textAlign="center">
              <Header as="h2">
                <Icon name="user circle" />
                User
              </Header>
            </Card.Header>

            <Card.Description>
              <Card.Group centered style={{ margin: 0, 'align-items': 'center' }}>
                <Card style={{ width: 'auto' }}>
                  <Card.Content>
                    <Header as="h3">Change Details</Header>
                    Update your user details
                  </Card.Content>
                  <Card.Content extra>
                    <Button animated>
                      <Button.Content visible>
                        <Icon size="large" name="add square" />
                      </Button.Content>
                      <Button.Content hidden>Apply</Button.Content>
                    </Button>
                    <Button animated>
                      <Button.Content visible>
                        <Icon size="large" name="list alternate" />
                      </Button.Content>
                      <Button.Content hidden>List</Button.Content>
                    </Button>
                  </Card.Content>
                </Card>
              </Card.Group>
            </Card.Description>
          </Card.Content>
        </Card>
      </Card.Group> */}

      {/* <Segment.Group compact>
        <Segment textAlign="center">
          <Header>
            <Icon name="vcard" />
            Organisations
          </Header>
        </Segment>

        <Segment.Group>
          <Segment.Group horizontal>
            <Segment>Join Organisation</Segment>
            <Segment>Create Organisation</Segment>
          </Segment.Group>
        </Segment.Group>
      </Segment.Group>

      <Segment.Group compact>
        <Segment textAlign="center">
          <Header>
            <Icon name="vcard" />
            Organisations
          </Header>
        </Segment>

        <Segment.Group>
          <Segment.Group horizontal>
            <Segment>Join Organisation</Segment>
            <Segment>Create Organisation</Segment>
          </Segment.Group>
        </Segment.Group>
      </Segment.Group> */}

      {/* <Label>Hello, {currentUser?.firstName}. Welcome to the Dashboard!</Label> */}

      {/* <Header as="h2">Quick Links (for Dev)</Header>
      <List>
        <List.Item>
          <Link to="/applications">Applications list</Link>
        </List.Item>
        <List.Item>
          <Link to="/application/new?type=TestRego">Feature showcase application</Link>
        </List.Item>
        <List.Item>
          <Link to="/application/new?type=UserRegistration">User registration application</Link>
        </List.Item>
      </List> */}
    </div>
  )
}

export default Home
