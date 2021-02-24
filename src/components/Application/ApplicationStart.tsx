import React, { useState, useEffect } from 'react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { Button, Divider, Grid, Header, List, Progress, Segment, Sticky } from 'semantic-ui-react'
import strings from '../../utils/constants'
import {
  EvaluatorParameters,
  ResumeSection,
  SectionsStructure,
  TemplateDetails,
} from '../../utils/types'
import ApplicationSelectType from './ApplicationSelectType'
import Markdown from '../../utils/helpers/semanticReactMarkdown'
import evaluate from '@openmsupply/expression-evaluator'
import { useUserState } from '../../contexts/UserState'
import { checkSectionsProgress } from '../../utils/helpers/structure/checkSectionsProgress'
export interface ApplicationStartProps extends RouteComponentProps {
  template: TemplateDetails
  sections: SectionsStructure
  resumeApplication?: (props: ResumeSection) => void
  startApplication?: () => void
  setSummaryButtonClicked?: () => void
}

const ApplicationStart: React.FC<ApplicationStartProps> = ({
  template,
  sections,
  resumeApplication,
  startApplication,
  setSummaryButtonClicked,
}) => {
  const { name, code, startMessage } = template
  const [startMessageEvaluated, setStartMessageEvaluated] = useState('')
  const [isApplicationCompleted, setIsApplicationCompleted] = useState(false)
  const [firstIncomplete, setFirstIncomplete] = useState<string>()
  const {
    userState: { currentUser },
  } = useUserState()

  useEffect(() => {
    if (!currentUser) return
    const evaluatorParams: EvaluatorParameters = {
      objects: { currentUser },
      APIfetch: fetch,
    }
    evaluate(startMessage || '', evaluatorParams).then((result: any) =>
      setStartMessageEvaluated(result)
    )

    const { isCompleted, firstIncompleteLocation } = checkSectionsProgress(sections)
    setIsApplicationCompleted(isCompleted)
    if (firstIncompleteLocation) setFirstIncomplete(firstIncompleteLocation)
  }, [startMessage, currentUser])

  return template ? (
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
        {template && (
          <Segment basic>
            <Header as="h5">{strings.SUBTITLE_APPLICATION_STEPS}</Header>
            <Header as="h5">{strings.TITLE_STEPS.toUpperCase()}</Header>
            <List divided relaxed="very">
              {sections &&
                Object.entries(sections).map(([sectionCode, { details, progress }]) => {
                  return (
                    <List.Item
                      key={`list-item-${sectionCode}`}
                      children={
                        <Grid>
                          <Grid.Column width={1}>
                            {progress?.completed ? (
                              <List.Icon color="green" name="check circle" />
                            ) : (
                              <List.Icon name="circle outline" />
                            )}
                          </Grid.Column>
                          <Grid.Column width={10}>
                            <p>{details.title}</p>
                          </Grid.Column>
                          <Grid.Column width={3}>
                            {progress && progress.done > 0 && progress.total > 0 && (
                              <Progress
                                percent={(100 * progress.done) / progress.total}
                                size="tiny"
                                success={progress.valid}
                                error={!progress.valid}
                              />
                            )}
                          </Grid.Column>
                          <Grid.Column width={2}>
                            {resumeApplication && progress && sectionCode === firstIncomplete && (
                              <Button
                                color="blue"
                                onClick={() =>
                                  resumeApplication({ sectionCode, page: progress.linkedPage })
                                }
                              >
                                {strings.BUTTON_APPLICATION_RESUME}
                              </Button>
                            )}
                          </Grid.Column>
                        </Grid>
                      }
                    ></List.Item>
                  )
                })}
            </List>
            <Divider />
            <Markdown text={startMessageEvaluated} semanticComponent="Message" info />
            {startApplication && (
              <Button color="blue" onClick={startApplication}>
                {strings.BUTTON_APPLICATION_START}
              </Button>
            )}
          </Segment>
        )}
      </Segment>
      {isApplicationCompleted && (
        <Sticky
          pushing
          style={{ backgroundColor: 'white', boxShadow: ' 0px -5px 8px 0px rgba(0,0,0,0.1)' }}
        >
          <Segment basic textAlign="right">
            <Button color="blue" onClick={setSummaryButtonClicked}>
              {strings.BUTTON_SUMMARY}
            </Button>
          </Segment>
        </Sticky>
      )}
    </Segment.Group>
  ) : (
    <ApplicationSelectType />
  )
}

export default withRouter(ApplicationStart)
