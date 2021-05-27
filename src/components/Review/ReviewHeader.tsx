import React from 'react'
import { Container, Header } from 'semantic-ui-react'
import strings from '../../utils/constants'
import Stage from './Stage'

export interface ReviewHeaderProps {
  applicationStage: string
  applicationStageColour: string
  applicationName: string
}

const ReviewHeader: React.FC<ReviewHeaderProps> = ({
  applicationStage,
  applicationStageColour,
  applicationName,
  children,
}) => {
  return (
    <Container id="application-summary">
      <Stage name={applicationStage} colour={applicationStageColour} />
      <div id="application-summary-header">
        <Header as="h2" textAlign="center">
          <strong>{applicationName}</strong>
          <Header.Subheader>{strings.DATE_APPLICATION_PLACEHOLDER}</Header.Subheader>
        </Header>
        <Header as="h2" textAlign="center" content={strings.LABEL_REVIEW} />
        <p>{strings.SUBTITLE_REVIEW}</p>
      </div>
      {children}
    </Container>
  )
}

export default ReviewHeader
