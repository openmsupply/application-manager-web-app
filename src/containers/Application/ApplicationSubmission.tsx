import React from 'react'
import { Button, Header, Icon, Label, List, Segment } from 'semantic-ui-react'
import Markdown from '../../utils/helpers/semanticReactMarkdown'
import { ApplicationProps } from '../../utils/types'
import { useUserState } from '../../contexts/UserState'
import { useRouter } from '../../utils/hooks/useRouter'
import strings from '../../utils/constants'
import { Link } from 'react-router-dom'
import { ApplicationStatus } from '../../utils/generated/graphql'

const ApplicationSubmission: React.FC<ApplicationProps> = ({ structure }) => {
  const {
    userState: { currentUser },
  } = useUserState()

  const {
    query: { serialNumber },
    push,
  } = useRouter()
  const {
    info: { current, submissionMessage, type },
    stages,
  } = structure

  // Check if application not submitted and redirect to the summary page
  // Note: The summary page has its own redirection logic to a specific page (with invalid items).
  if (
    current?.status === ApplicationStatus.Draft ||
    current?.status === ApplicationStatus.ChangesRequired
  )
    push(`/application/${serialNumber}/summary`)

  return (
    <Segment.Group style={{ backgroundColor: 'Gainsboro', display: 'flex' }}>
      <Header textAlign="center">
        {currentUser?.organisation?.orgName || strings.TITLE_NO_ORGANISATION}
      </Header>
      <Segment
        textAlign="center"
        style={{
          backgroundColor: 'white',
          padding: 10,
          margin: '0px 50px',
          minHeight: 500,
          flex: 1,
        }}
      >
        <Header icon>
          <Icon name="clock outline" color="blue" size="huge" />
          {strings.LABEL_PROCESSING}
        </Header>
        <Markdown text={submissionMessage || ''} />
        <Segment basic textAlign="left" style={{ margin: '50px 50px', padding: 10 }}>
          <Header as="h5">{strings.SUBTITLE_SUBMISSION_STEPS}</Header>
          <List>
            {stages.map(({ title, description }) =>
              title ? (
                <List.Item key={`list_stage_${title}`}>
                  <List.Header>{title}</List.Header>
                  {description}
                </List.Item>
              ) : null
            )}
          </List>
        </Segment>
        <Segment basic textAlign="center" style={{ margin: '50px 50px', padding: 10 }}>
          <Button
            color="blue"
            as={Link}
            to={`/application/${serialNumber}/summary`}
            style={{ minWidth: 200 }}
            content={`${strings.BUTTON_BACK_TO} ${type}`}
          />
          <Label as={Link} to={'/'} content={strings.BUTTON_BACK_DASHBOARD} />
        </Segment>
      </Segment>
    </Segment.Group>
  )
}

export default ApplicationSubmission
