import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Header, Segment } from 'semantic-ui-react'
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
    <Segment.Group style={{ backgroundColor: 'Gainsboro', display: 'flex' }}>
      <Button
        as={Link}
        to={`/applications?type=${code}`}
        icon="angle left"
        label={{ content: `${name} ${strings.LABEL_APPLICATIONS}`, color: 'grey' }}
      />
      <Header textAlign="center">
        {currentUser?.organisation?.orgName || strings.TITLE_NO_ORGANISATION}
      </Header>
      <Segment
        style={{
          backgroundColor: 'white',
          padding: 10,
          margin: '0px 50px',
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
    </Segment.Group>
  )
}

export default ApplicationHeader
