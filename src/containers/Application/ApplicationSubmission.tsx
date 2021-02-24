import React, { useEffect, useState } from 'react'
import { Button, Header, Icon, Label, List, Message, Segment } from 'semantic-ui-react'
import { Loading, NoMatch } from '../../components'
import strings from '../../utils/constants'
import { EvaluatorParameters, User } from '../../utils/types'
import { useRouter } from '../../utils/hooks/useRouter'
import { useUserState } from '../../contexts/UserState'
import useLoadApplication from '../../utils/hooks/useLoadApplication'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { Link } from 'react-router-dom'
import evaluate from '@openmsupply/expression-evaluator'
import Markdown from '../../utils/helpers/semanticReactMarkdown'

const ApplicationSubmission: React.FC = () => {
  const [submissionMessageEvaluated, setSubmissionMessageEvaluated] = useState('')
  const {
    userState: { currentUser },
  } = useUserState()

  const { query, push } = useRouter()
  const { serialNumber } = query

  const { error, loading, application, appStages, isApplicationReady } = useLoadApplication({
    serialNumber: serialNumber as string,
    currentUser: currentUser as User,
    networkFetch: true,
  })

  useEffect(() => {
    const evaluatorParams: EvaluatorParameters = {
      objects: { currentUser },
      APIfetch: fetch,
    }
    evaluate(appStages?.submissionMessage || '', evaluatorParams).then((result: any) =>
      setSubmissionMessageEvaluated(result)
    )
  }, [appStages, currentUser])

  useEffect(() => {
    if (!isApplicationReady) return
    const status = application?.current?.status
    // Check if application is in Draft or Changes required status and redirect to the summary page
    // Note: The summary page has its own redirection logic to a specific page (with invalid items).
    if (status === ApplicationStatus.Draft || status === ApplicationStatus.ChangesRequired) {
      push(`/application/${serialNumber}/summary`)
    }
  }, [isApplicationReady])

  return error ? (
    <NoMatch />
  ) : loading ? (
    <Loading />
  ) : serialNumber && appStages ? (
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
        {appStages && <Markdown text={submissionMessageEvaluated} />}
        {appStages && (
          <Segment basic textAlign="left" style={{ margin: '50px 50px', padding: 10 }}>
            <Header as="h5">{strings.SUBTITLE_SUBMISSION_STEPS}</Header>
            <List>
              {appStages.stages.map((stage) => {
                const { title, description } = stage
                return title ? (
                  <List.Item key={`list_stage_${title}`}>
                    <List.Header>{title}</List.Header>
                    {description}
                  </List.Item>
                ) : null
              })}
            </List>
          </Segment>
        )}
        {currentUser && (
          <Segment basic textAlign="center" style={{ margin: '50px 50px', padding: 10 }}>
            <Button
              color="blue"
              as={Link}
              to={`/application/${serialNumber}/summary`}
              style={{ minWidth: 200 }}
            >{`${strings.BUTTON_BACK_TO} ${application?.type}`}</Button>
            <Label as={Link} to={'/'}>
              {strings.BUTTON_BACK_DASHBOARD}
            </Label>
          </Segment>
        )}
      </Segment>
    </Segment.Group>
  ) : (
    <Message error header={strings.ERROR_APPLICATION_SUBMISSION} />
  )
}

export default ApplicationSubmission
