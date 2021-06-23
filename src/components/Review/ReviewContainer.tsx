import React from 'react'
import { Container, Header, Icon, Label } from 'semantic-ui-react'
import { useRouter } from '../../utils/hooks/useRouter'
import { ApplicationDetails } from '../../utils/types'
import strings from '../../utils/constants'

export interface ReviewContainerProps {
  application: ApplicationDetails
}

const ReviewContainer: React.FC<ReviewContainerProps> = ({ application, children }) => {
  const { push } = useRouter()
  const { serial, org } = application
  return (
    <Container id="review-area">
      <div className="top-container">
        <Label
          className="back-label clickable"
          onClick={() => push(`/application/${serial}/review`)}
          content={
            <>
              <Icon name="chevron left" className="dark-grey" />
              {strings.BUTTON_BACK}
            </>
          }
        />
        <Header as="h3" className="heading-alt" textAlign="center">
          {org?.name || strings.TITLE_NO_ORGANISATION}
        </Header>
      </div>
      {children}
    </Container>
  )
}

export default ReviewContainer
