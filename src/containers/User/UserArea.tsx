import React from 'react'
import {
  Button,
  Container,
  Grid,
  Icon,
  Label,
  Message,
  Segment,
  Sticky,
  Image,
} from 'semantic-ui-react'
import strings from '../../utils/constants'
import { useUserState } from '../../contexts/UserState'
import UserSelection from './UserSelection'
import useListTemplates from '../../utils/hooks/useListTemplates'
import { AppMenu } from '../../components'
import { Link } from 'react-router-dom'

const UserArea: React.FC = () => {
  const {
    userState: { currentUser, isLoading, templatePermissions },
    logout,
  } = useUserState()
  const { error, loading, filteredTemplates } = useListTemplates(templatePermissions, isLoading)

  return (
    <Container
      style={{ position: 'fixed', background: '#4A4A4A', top: 0, zIndex: 1000, height: 135 }}
    >
      <div style={{ display: 'flex', padding: 20, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link
            to="/dashboard"
            style={{ color: 'rgb(240,240,240)', fontSize: 14, letterSpacing: 1 }}
          >
            <Icon name="home" />
            Dashboard
          </Link>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center' }}>
            <Image
              style={{ height: 60, width: 60, boxShadow: '0px 0px 3px rgb(240,240,240)' }}
              src="/images/ss.png"
              circular
            />
            <div
              style={{
                marginLeft: 20,
                color: 'rgb(200,200,200)',
                fontSize: 27,
                fontWeight: 500,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              {currentUser?.organisation?.orgName || 'ABC COMPANY'}
              <Icon size="small" name="angle down" />
            </div>
          </div>
        </div>
        <div>
          <Button
            animated
            style={{
              background: 'rgb(248,248,248)',
              border: 'none',
              borderRadius: 20,
              fontSize: 14,
              color: 'rgb(50,50,50)',
              paddingRight: 5,
            }}
            onClick={() => logout()}
          >
            <Button.Content visible>
              {' '}
              {currentUser?.firstName || ''} {currentUser?.lastName || ''}
            </Button.Content>
            <Button.Content hidden>
              {' '}
              <Icon name="log out" />
            </Button.Content>
          </Button>
        </div>
        <Label
          as="button"
          color="grey"
          style={{ width: 200, position: 'fixed', bottom: 4, right: 5, padding: 10 }}
        >
          {currentUser?.firstName}
          <UserSelection />
        </Label>
      </div>
      {/* <Segment inverted vertical>
        <Grid inverted>
          <Grid.Column width={12}>
            {error ? (
              <Message error list={[error]} />
            ) : (
              <AppMenu templatePermissions={filteredTemplates} />
            )}

            <Segment inverted>
              {currentUser?.organisation?.orgName || strings.TITLE_NO_ORGANISATION}
            </Segment>
          </Grid.Column>
          <Grid.Column width={4}>
            {currentUser && (
              <Segment inverted floated="right">
                <Label as="button" color="grey" style={{ width: '100%', padding: 10 }}>
                  {currentUser?.firstName}
                  <UserSelection />
                </Label>
                <Button basic color="blue" onClick={() => logout()}>
                  {strings.LABEL_LOG_OUT}
                </Button>
              </Segment>
            )}
          </Grid.Column>
        </Grid>
      </Segment> */}
    </Container>
  )
}

export default UserArea
