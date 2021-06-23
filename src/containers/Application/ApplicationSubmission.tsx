import React from 'react'
import { Button, Header, Icon, List, Segment, Container } from 'semantic-ui-react'
import Markdown from '../../utils/helpers/semanticReactMarkdown'
import { ApplicationProps } from '../../utils/types'
import { useUserState } from '../../contexts/UserState'
import { Stage } from '../../components/Review'
import { useRouter } from '../../utils/hooks/useRouter'
import strings from '../../utils/constants'
import { Link } from 'react-router-dom'
import { ApplicationStatus } from '../../utils/generated/graphql'

const ApplicationSubmission: React.FC<ApplicationProps> = ({ structure }) => {
  const {
    userState: { isNonRegistered },
    logout,
  } = useUserState()

  const {
    query: { serialNumber },
    push,
  } = useRouter()
  const {
    info: {
      currentStage: { status },
      submissionMessage,
      name,
    },
    stages,
  } = structure

  // Check if application not submitted and redirect to the summary page
  // Note: The summary page has its own redirection logic to a specific page (with invalid items).
  if (status === ApplicationStatus.Draft || status === ApplicationStatus.ChangesRequired)
    push(`/application/${serialNumber}/summary`)

  return (
    <Container id="application-summary">
      <Segment basic textAlign="center" id="submission-header">
        <Header as="h4" icon>
          <Icon name="clock outline" className="information-colour" size="huge" />
          {strings.LABEL_PROCESSING}
        </Header>
        <Markdown text={submissionMessage || ''} />
      </Segment>
      {!isNonRegistered && (
        <>
          <Segment basic textAlign="left" id="submission-content">
            <p className="dark-grey">{strings.SUBTITLE_SUBMISSION_STEPS}</p>
            <List>
              {stages.map(({ name, description, colour }) =>
                name ? (
                  <List.Item key={`list_stage_${name}`}>
                    <List.Content>
                      <List.Header>
                        <Stage name={name} colour={colour as string} />
                      </List.Header>
                      <List.Description>{description}</List.Description>
                    </List.Content>
                  </List.Item>
                ) : null
              )}
            </List>
          </Segment>
          <Segment basic textAlign="center" id="submission-nav">
            <Button
              color="blue"
              as={Link}
              to={`/application/${serialNumber}/summary`}
              content={`${strings.BUTTON_BACK_TO} ${name}`}
            />
            <p>
              <Link to={'/'}>
                <strong>{strings.BUTTON_BACK_DASHBOARD}</strong>
              </Link>
            </p>
          </Segment>
        </>
      )}
      {isNonRegistered && (
        <Segment basic textAlign="center" id="submission-nav">
          <Button primary onClick={() => logout()}>
            {strings.ACTION_CONTINUE}
          </Button>
        </Segment>
      )}
    </Container>
  )
}

export default ApplicationSubmission
