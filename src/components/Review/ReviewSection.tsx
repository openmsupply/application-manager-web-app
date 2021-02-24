import React, { useState } from 'react'
import {
  Button,
  Card,
  Container,
  Grid,
  Header,
  Icon,
  Label,
  Segment,
  Accordion,
} from 'semantic-ui-react'
import { SummaryViewWrapper } from '../../formElementPlugins'
import { SummaryViewWrapperProps } from '../../formElementPlugins/types'
import strings from '../../utils/constants'
import { ReviewResponseDecision, TemplateElementCategory } from '../../utils/generated/graphql'
import messages from '../../utils/messages'
import { ReviewQuestionDecision, ResponsesByCode, SectionState } from '../../utils/types'

interface ReviewSectionProps {
  allResponses: ResponsesByCode
  assignedToYou: boolean
  reviewSection: SectionState
  updateResponses: (props: ReviewQuestionDecision[]) => void
  setDecisionArea: (
    review: ReviewQuestionDecision,
    summaryViewProps: SummaryViewWrapperProps
  ) => void
  canEdit: boolean
  showError: boolean
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  allResponses,
  assignedToYou,
  reviewSection,
  updateResponses,
  setDecisionArea,
  canEdit,
  showError,
}) => {
  const { assigned, details: section, pages } = reviewSection
  const [isOpen, setIsOpen] = useState(false)

  const showSectionAssignment = assignedToYou ? (
    <Label style={{ backgroundColor: 'WhiteSmoke', color: 'Blue' }}>
      {strings.LABEL_ASSIGNED_TO_YOU}
    </Label>
  ) : (
    <Label style={{ backgroundColor: 'WhiteSmoke' }}>{strings.LABEL_ASSIGNED_TO_OTHER}</Label>
  )

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <Accordion fluid>
      <Segment
        key={`ReviewSection_${section.code}`}
        style={{
          backgroundColor: 'WhiteSmoke',
          marginLeft: '10%',
          marginRight: '10%',
        }}
      >
        <Accordion.Title active={isOpen} onClick={handleClick}>
          <Grid columns={3}>
            <Grid.Row>
              <Grid.Column width={6}>
                <Header as="h2" content={`${section.title}`} style={{ color: 'Grey' }} />
              </Grid.Column>
              <Grid.Column width={6}>
                {showError && (
                  <Icon name="exclamation circle" color="red">
                    {messages.REVIEW_COMPLETE_SECTION}
                  </Icon>
                )}
              </Grid.Column>
              <Grid.Column width={3}>
                <Container textAlign="right">{showSectionAssignment}</Container>
              </Grid.Column>
              <Grid.Column width={1}>
                <Icon name={isOpen ? 'angle up' : 'angle down'} size="large" />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Accordion.Title>
        <Accordion.Content active={isOpen}>
          {Object.entries(pages).map(([pageName, { state }]) => {
            const elementsToReview = state
              .filter(({ review }) => review && review.decision === undefined)
              .map(({ review }) => review as ReviewQuestionDecision)
            const reviewsNumber = elementsToReview.length
            return (
              <Segment key={`ReviewSection_${section.code}_${pageName}`} basic>
                <Header as="h3" style={{ color: 'DarkGrey' }}>
                  {pageName}
                </Header>
                {state.map(({ element, response, review }) => {
                  const { category } = element
                  const summaryViewProps = {
                    element,
                    response,
                    allResponses,
                  }
                  // if (category === TemplateElementCategory.Question) {
                  return (
                    <Segment key={`ReviewElement_${element.code}`}>
                      <Grid columns={2} verticalAlign="middle">
                        <Grid.Row>
                          <Grid.Column>
                            <SummaryViewWrapper {...summaryViewProps} />
                          </Grid.Column>
                          <Grid.Column>
                            {review && canEdit && (
                              <Container textAlign="right">
                                {review?.decision === undefined && (
                                  <Button
                                    size="small"
                                    onClick={() => setDecisionArea(review, summaryViewProps)}
                                    content={strings.BUTTON_REVIEW_RESPONSE}
                                  />
                                )}
                              </Container>
                            )}
                          </Grid.Column>
                        </Grid.Row>
                        {review && canEdit && review.decision && (
                          <Grid.Row>
                            <Card fluid>
                              <Card.Content>
                                <Grid>
                                  <Grid.Row>
                                    <Grid.Column width="10">
                                      <Card.Header>{review.decision}</Card.Header>
                                      <Card.Description>{review.comment}</Card.Description>
                                      {assigned && (
                                        <Card.Meta>{`${assigned.firstName} ${assigned.lastName}`}</Card.Meta>
                                      )}
                                    </Grid.Column>
                                    <Grid.Column width="2">
                                      <Icon
                                        name="pencil square"
                                        color="blue"
                                        style={{ minWidth: 100 }}
                                        onClick={() => setDecisionArea(review, summaryViewProps)}
                                      />
                                    </Grid.Column>
                                  </Grid.Row>
                                </Grid>
                              </Card.Content>
                            </Card>
                          </Grid.Row>
                        )}
                      </Grid>
                    </Segment>
                  )
                  // }
                })}
                {reviewsNumber > 0 && (
                  <Button
                    color="blue"
                    inverted
                    style={{ margin: 10 }}
                    onClick={() => {
                      updateResponses(
                        elementsToReview.map((review) => ({
                          id: review.id,
                          decision: ReviewResponseDecision.Approve,
                          comment: '',
                        }))
                      )
                    }}
                  >{`${strings.BUTTON_REVIEW_APPROVE_ALL}(${reviewsNumber})`}</Button>
                )}
              </Segment>
            )
          })}
        </Accordion.Content>
      </Segment>
    </Accordion>
  )
}

export default ReviewSection
