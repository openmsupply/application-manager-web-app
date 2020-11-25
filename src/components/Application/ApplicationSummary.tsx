import React from 'react'
import { Button, Container, Form, Grid, Header, Segment } from 'semantic-ui-react'
import { SummaryViewWrapper } from '../../elementPlugins'
import { SectionElementStates } from '../../utils/types'

interface ApplicationSummaryProps {
  sectionsAndElements: SectionElementStates[]
  onSubmitHandler: () => void
  appStatus: any
}

const ApplicationSummary: React.FC<ApplicationSummaryProps> = ({
  sectionsAndElements,
  onSubmitHandler,
  appStatus: { status: status },
}) => {
  return (
    <Container style={{ marginTop: '2em' }}>
      <Header as="h1" content="REVIEW AND SUBMIT" />
      <Form>
        {sectionsAndElements.map(({ section, elements }) => (
          <Segment.Group size="large">
            <Grid columns={2}>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h2" content={`${section.title}`} />
                </Grid.Column>
                <Grid.Column>
                  {status === 'DRAFT' ? (
                    <Header as="h5" icon="pencil" floated="right" content="edit" color="blue" />
                  ) : null}
                </Grid.Column>
              </Grid.Row>
            </Grid>
            {elements.map((element) => (
              <SummaryViewWrapper element={element.element} value={element.value} />
            ))}
          </Segment.Group>
        ))}
        {status === 'DRAFT' ? (
          <Button
            content="Submit application"
            onClick={() => {
              onSubmitHandler()
            }}
          />
        ) : null}
      </Form>
    </Container>
  )
}

export default ApplicationSummary
