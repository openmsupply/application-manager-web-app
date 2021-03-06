import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ElementStateNEW, PageElement, ResponsesByCode, SectionAndPage } from '../../utils/types'
import ApplicationViewWrapper from '../../formElementPlugins/ApplicationViewWrapperNEW'
import SummaryViewWrapperNEW from '../../formElementPlugins/SummaryViewWrapperNEW'
import { Form, Grid, Segment, Button, Icon } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { ReviewResponse, TemplateElementCategory } from '../../utils/generated/graphql'

import DecisionAreaNEW from '../Review/DecisionAreaNEW'
import { SummaryViewWrapperPropsNEW } from '../../formElementPlugins/types'

interface PageElementProps {
  elements: PageElement[]
  responsesByCode: ResponsesByCode
  isStrictPage?: boolean
  canEdit?: boolean
  isReview?: boolean
  isSummary?: boolean
  serial?: string
  sectionAndPage?: SectionAndPage
}

const PageElements: React.FC<PageElementProps> = ({
  elements,
  responsesByCode,
  isStrictPage,
  canEdit,
  isReview,
  isSummary,
  serial,
  sectionAndPage,
}) => {
  // Editable Application page
  if (canEdit && !isReview && !isSummary)
    return (
      <Form>
        {elements.map(({ element }) => {
          return (
            <ApplicationViewWrapper
              key={`question_${element.code}`}
              element={element}
              isStrictPage={isStrictPage}
              allResponses={responsesByCode}
              currentResponse={responsesByCode?.[element.code]}
            />
          )
        })}
      </Form>
    )

  const getSummaryViewProps = (element: ElementStateNEW) => ({
    element,
    response: responsesByCode?.[element.code],
    allResponses: responsesByCode,
  })
  // Summary Page
  if (isSummary) {
    const { sectionCode, pageNumber } = sectionAndPage as SectionAndPage
    return (
      <Form>
        <Segment.Group>
          {elements.map(({ element }) => {
            return (
              <Segment key={`question_${element.code}`}>
                <Grid columns="equal">
                  <Grid.Column floated="left">
                    <SummaryViewWrapperNEW {...getSummaryViewProps(element)} />
                  </Grid.Column>
                  {element.category === TemplateElementCategory.Question && canEdit && (
                    <Grid.Column floated="right" textAlign="right">
                      <Button
                        content={strings.BUTTON_SUMMARY_EDIT}
                        size="small"
                        as={Link}
                        to={`/application/${serial}/${sectionCode}/Page${pageNumber}`}
                      />
                    </Grid.Column>
                  )}
                </Grid>
              </Segment>
            )
          })}
        </Segment.Group>
      </Form>
    )
  }

  // Review Page -- TO-DO
  if (isReview)
    return (
      <Form>
        <Segment.Group>
          {elements.map(({ element, thisReviewLatestResponse }) => (
            <Segment key={`question_${element.id}`}>
              <Grid columns="equal">
                <Grid.Column floated="left">
                  <SummaryViewWrapperNEW {...getSummaryViewProps(element)} />
                </Grid.Column>
                {thisReviewLatestResponse && (
                  <Grid.Column floated="right" textAlign="right">
                    <ReviewButton
                      reviewResponse={thisReviewLatestResponse as ReviewResponse}
                      summaryViewProps={getSummaryViewProps(element)}
                    />
                  </Grid.Column>
                )}
              </Grid>
              <ReviewResponseComponent
                reviewResponse={thisReviewLatestResponse as ReviewResponse}
                summaryViewProps={getSummaryViewProps(element)}
              />
            </Segment>
          ))}
        </Segment.Group>
      </Form>
    )

  return null
}

const ReviewResponseComponent: React.FC<{
  reviewResponse: ReviewResponse
  summaryViewProps: SummaryViewWrapperPropsNEW
}> = ({ reviewResponse, summaryViewProps }) => {
  const [toggleDecisionArea, setToggleDecisionArea] = useState(false)

  if (!reviewResponse) return null
  if (!reviewResponse?.decision) return null

  return (
    <>
      <Grid columns="equal">
        <Grid.Column floated="left">
          <p>{reviewResponse?.decision}</p>
          <p>{reviewResponse?.comment || ''}</p>
        </Grid.Column>
        <Grid.Column floated="right" textAlign="right">
          <Icon
            name="pencil"
            color="blue"
            onClick={() => setToggleDecisionArea(!toggleDecisionArea)}
          />
        </Grid.Column>
      </Grid>
      <DecisionAreaNEW
        reviewResponse={reviewResponse}
        toggle={toggleDecisionArea}
        summaryViewProps={summaryViewProps}
      />
    </>
  )
}

const ReviewButton: React.FC<{
  reviewResponse: ReviewResponse
  summaryViewProps: SummaryViewWrapperPropsNEW
}> = ({ reviewResponse, summaryViewProps }) => {
  const [toggleDecisionArea, setToggleDecisionArea] = useState(false)

  if (!reviewResponse) return null
  if (reviewResponse?.decision) return null

  return (
    <>
      <Button
        content={strings.BUTTON_REVIEW_RESPONSE}
        size="small"
        onClick={() => setToggleDecisionArea(!toggleDecisionArea)}
      />
      <DecisionAreaNEW
        reviewResponse={reviewResponse}
        toggle={toggleDecisionArea}
        summaryViewProps={summaryViewProps}
      />
    </>
  )
}

export default PageElements
