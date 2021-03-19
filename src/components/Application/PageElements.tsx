import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ElementStateNEW, PageElement, ResponsesByCode, SectionAndPage } from '../../utils/types'
import ApplicationViewWrapper from '../../formElementPlugins/ApplicationViewWrapperNEW'
import SummaryViewWrapperNEW from '../../formElementPlugins/SummaryViewWrapperNEW'
import { Form, Grid, Segment, Button, Icon } from 'semantic-ui-react'
import strings from '../../utils/constants'
import {
  ApplicationResponse,
  ReviewResponse,
  ReviewResponseStatus,
  TemplateElementCategory,
} from '../../utils/generated/graphql'

import {
  ApplicationViewWrapperPropsNEW,
  SummaryViewWrapperPropsNEW,
} from '../../formElementPlugins/types'
import DecisionAreaNEW from '../Review/DecisionAreaNEW'

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
  const visibleElements = elements.filter(({ element }) => element.isVisible)

  // Editable Application page
  if (canEdit && !isReview && !isSummary)
    return (
      <Form>
        {visibleElements.map(({ element, isChanged, previousApplicationResponse }) => {
          const visibleReviews = previousApplicationResponse?.reviewResponses.nodes
          const props: ApplicationViewWrapperPropsNEW = {
            element,
            isStrictPage,
            isChanged: isChanged as boolean,
            allResponses: responsesByCode,
            currentResponse: responsesByCode?.[element.code],
            currentReview:
              visibleReviews?.length > 0 ? (visibleReviews[0] as ReviewResponse) : undefined,
          }
          // Wrapper displays response & changes requested warning for LOQ re-submission
          return <ApplicationViewWrapper key={`question_${element.code}`} {...props} />
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
          {visibleElements
            .filter(({ element }) => element.isVisible)
            .map(({ element }) => {
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

  // TODO: Find out problem to display edit button with review responses when Review is locked

  if (isReview)
    return (
      <Form>
        <Segment.Group>
          {visibleElements.map(
            ({
              element,
              thisReviewLatestResponse,
              isNewApplicationResponse,
              latestApplicationResponse,
            }) => (
              <Segment key={`question_${element.id}`}>
                <Grid columns="equal">
                  <Grid.Column floated="left">
                    <SummaryViewWrapperNEW {...getSummaryViewProps(element)} />
                  </Grid.Column>
                  <Grid.Column floated="right" textAlign="right">
                    <ReviewButton
                      isNewApplicationResponse={isNewApplicationResponse}
                      reviewResponse={thisReviewLatestResponse as ReviewResponse}
                      summaryViewProps={getSummaryViewProps(element)}
                    />
                  </Grid.Column>
                </Grid>
                <ReviewResponseComponent
                  latestApplicationResponse={latestApplicationResponse}
                  reviewResponse={thisReviewLatestResponse as ReviewResponse}
                  summaryViewProps={getSummaryViewProps(element)}
                />
              </Segment>
            )
          )}
        </Segment.Group>
      </Form>
    )

  return null
}

const ReviewResponseComponent: React.FC<{
  reviewResponse: ReviewResponse
  summaryViewProps: SummaryViewWrapperPropsNEW
  latestApplicationResponse: ApplicationResponse
}> = ({ reviewResponse, summaryViewProps, latestApplicationResponse }) => {
  const [toggleDecisionArea, setToggleDecisionArea] = useState(false)

  if (!reviewResponse) return null
  if (!reviewResponse?.decision) return null
  if (!reviewResponse?.decision) return null

  // After review is submitted, reviewResponses are trimmed if they are not changed duplicates
  // or if they are null, we only want to show reviewResponses that are linked to latestApplicationResponse
  if (latestApplicationResponse.id !== reviewResponse.applicationResponse?.id) return null

  return (
    <>
      <Grid columns="equal">
        <Grid.Column floated="left">
          <p>{reviewResponse?.decision}</p>
          <p>{reviewResponse?.comment || ''}</p>
        </Grid.Column>
        {reviewResponse.status === ReviewResponseStatus.Draft && (
          <Grid.Column floated="right" textAlign="right">
            <Icon
              name="pencil"
              color="blue"
              onClick={() => setToggleDecisionArea(!toggleDecisionArea)}
            />
          </Grid.Column>
        )}
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
  isNewApplicationResponse?: boolean
}> = ({ reviewResponse, summaryViewProps, isNewApplicationResponse }) => {
  const [toggleDecisionArea, setToggleDecisionArea] = useState(false)

  if (!reviewResponse) return null
  if (reviewResponse?.decision) return null
  if (reviewResponse.status !== ReviewResponseStatus.Draft) return null

  return (
    <>
      <Button
        content={
          isNewApplicationResponse
            ? strings.BUTTON_RE_REVIEW_RESPONSE
            : strings.BUTTON_REVIEW_RESPONSE
        }
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
