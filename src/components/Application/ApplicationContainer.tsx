import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Header, Icon, Label } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { TemplateDetails, User } from '../../utils/types'

export interface AppHeaderProps {
  template: TemplateDetails
  currentUser: User | null
}

const ApplicationContainer: React.FC<AppHeaderProps> = ({ template, currentUser, children }) => {
  const { code, name } = template
  return (
    <Container id="application-area">
      <div className="top-container">
        <Label
          className="back-label"
          as={Link}
          to={`/applications?type=${code}`}
          content={
            <>
              <Icon name="angle left" />
              {`${name} ${strings.LABEL_APPLICATIONS}`}
            </>
          }
        />
        <Header as="h2" className="heading-alt" textAlign="center">
          {currentUser?.organisation?.orgName || strings.TITLE_NO_ORGANISATION}
        </Header>
      </div>
      {children}
    </Container>
  )
}

export default ApplicationContainer
