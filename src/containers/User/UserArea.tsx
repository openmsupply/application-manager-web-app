import React from 'react'
import { Button, Grid, Label, Message, Segment, Sticky, Icon } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { useUserState } from '../../contexts/UserState'
import UserSelection from './UserSelection'
import useListTemplates from '../../utils/hooks/useListTemplates'
import { AppMenu } from '../../components'

const UserArea: React.FC = () => {
  const {
    userState: { currentUser, isLoading, templatePermissions },
    logout,
  } = useUserState()
  const { error, loading, filteredTemplates } = useListTemplates(templatePermissions, isLoading)

  return (
    <Sticky>
      <Segment inverted vertical style={{ height: 100, padding: 10 }}>
        <Segment inverted floated="left" style={{ margin: 5 }}>
          <Button animated basic inverted onClick={() => logout()}>
            <Button.Content visible>
              <Icon name="home" />
            </Button.Content>
            <Button.Content inverted hidden>
              Home
            </Button.Content>
          </Button>
        </Segment>
        {/* {error ? (
              <Message error list={[error]} />
            ) : (
              <AppMenu templatePermissions={filteredTemplates} />
            )} */}

        {/* <Segment inverted>{currentUser?.organisation?.orgName || ''}</Segment> */}

        {currentUser && (
          <Segment inverted floated="right" style={{ margin: 5 }}>
            <Button animated basic inverted onClick={() => logout()}>
              <Button.Content visible>
                <Icon name="user" />
                {currentUser?.firstName} {currentUser?.lastName}
              </Button.Content>
              <Button.Content inverted hidden>
                <Icon name="log out" />
                {strings.LABEL_LOG_OUT}
              </Button.Content>
            </Button>
            {/* <Label as="button" color="grey" style={{ width: '100%', padding: 10 }}>
                  {currentUser?.firstName}
                  <UserSelection />
                </Label> */}
            {/* <Button animated basic inverted onClick={() => logout()}>
                  <Button.Content visible>
                    <Icon name="log out" />
                  </Button.Content>
                  <Button.Content inverted hidden>
                    {strings.LABEL_LOG_OUT}
                  </Button.Content>
                </Button> */}
          </Segment>
        )}
      </Segment>
    </Sticky>
  )
}

export default UserArea
