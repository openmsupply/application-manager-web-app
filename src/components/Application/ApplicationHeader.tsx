import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Header, Icon, Segment } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { TemplateDetails, User } from '../../utils/types'

export interface AppHeaderProps {
  template: TemplateDetails
  currentUser: User | null
  ChildComponent: React.FC
}

const ApplicationHeader: React.FC<AppHeaderProps> = ({ template, currentUser, ChildComponent }) => {
  const { code, name } = template
  return (
    <>
      <Button as={Link} to={`/applications?type=${code}`} style={{ background: 'none' }} icon>
        <Icon name="angle left" />
        {`${name} ${strings.LABEL_APPLICATIONS}`}
      </Button>
      <Header
        textAlign="center"
        style={{
          color: 'rgb(150,150,150)',
          letterSpacing: 1,
          textTransform: 'uppercase',
          fontWeight: 400,
          fontSize: 24,
        }}
      >
        {currentUser?.organisation?.orgName || strings.TITLE_NO_ORGANISATION}
      </Header>
      <Segment
        style={{
          backgroundColor: 'white',

          minHeight: 500,
          flex: 1,
        }}
      >
        <Header as="h2" textAlign="center">
          {`${name} ${strings.TITLE_APPLICATION_FORM}`}
          <Header.Subheader>{strings.TITLE_INTRODUCTION}</Header.Subheader>
        </Header>
        <ChildComponent />
      </Segment>
    </>
  )
}

export default ApplicationHeader
