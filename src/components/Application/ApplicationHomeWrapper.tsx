import React from 'react'
import { Header, Container } from 'semantic-ui-react'
import Markdown from '../../utils/helpers/semanticReactMarkdown'
import strings from '../../utils/constants'

interface ApplicationHomeWrapperProps {
  startMessage?: string
  name: string
  ButtonSegment?: React.FC
}

const ApplicationHomeWrapper: React.FC<ApplicationHomeWrapperProps> = ({
  startMessage,
  name,
  ButtonSegment,
  children,
}) => {
  return (
    <>
      <Container id="application-home-content">
        <Header as="h2" textAlign="center">
          {`${name} ${strings.TITLE_APPLICATION_FORM}`}
          <Header.Subheader content={<Header as="h3" content={strings.TITLE_INTRODUCTION} />} />
        </Header>
        <p>{strings.SUBTITLE_APPLICATION_STEPS}</p>
        <Header as="h4" className="steps-header" content={strings.TITLE_STEPS} />
        {children}
        {startMessage && <Markdown text={startMessage || ''} semanticComponent="Message" info />}
        {ButtonSegment && <ButtonSegment />}
      </Container>
    </>
  )
}

export default ApplicationHomeWrapper
