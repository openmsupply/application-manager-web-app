import React from 'react'
import { Form, Segment } from 'semantic-ui-react'
import {
  ApplicationDetails,
  ElementState,
  PageElement,
  ResponsesByCode,
  SectionAndPage,
} from '../../../utils/types'
import { ApplicationViewWrapper } from '../../../formElementPlugins'
import { ApplicationViewWrapperProps } from '../../../formElementPlugins/types'
import { TemplateElementCategory } from '../../../utils/generated/graphql'
import SummaryInformationElement from './Elements/SummaryInformationElement'
import SummaryResponseElement from './Elements/SummaryResponseElement'
import SummaryResponseChangedElement from './Elements/SummaryResponseChangedElement'
import SummaryReviewResponseElement from './Elements/SummaryReviewResponseElement'
import ReviewResponseElement from './Elements/ReviewResponseElement'
import ReviewDecisionElement from './Elements/ReviewDecisionElement'

interface PageElementProps {
  elements: PageElement[]
  responsesByCode: ResponsesByCode
  applicationData: ApplicationDetails
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
  applicationData,
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
        {visibleElements.map(
          ({ element, isChangeRequest, isChanged, previousApplicationResponse }) => {
            const currentReview = previousApplicationResponse?.reviewResponses.nodes[0]
            const changesRequired =
              isChangeRequest || isChanged
                ? {
                    isChangeRequest: isChangeRequest as boolean,
                    isChanged: isChanged as boolean,
                    reviewerComment: currentReview?.comment || '',
                  }
                : undefined

            const props: ApplicationViewWrapperProps = {
              element,
              isStrictPage,
              changesRequired,
              allResponses: responsesByCode,
              applicationData,
              currentResponse: responsesByCode?.[element.code],
            }
            // Wrapper displays response & changes requested warning for LOQ re-submission
            return <ApplicationViewWrapper key={`question_${element.code}`} {...props} />
          }
        )}
      </Form>
    )

  const getSummaryViewProps = (element: ElementState) => ({
    element,
    response: responsesByCode?.[element.code],
    allResponses: responsesByCode,
    applicationData,
  })

  // Summary Page
  if (isSummary) {
    const { sectionCode, pageNumber } = sectionAndPage as SectionAndPage
    return (
      <Form>
        {visibleElements.map((state) => {
          const {
            element,
            isChanged,
            isChangeRequest,
            previousApplicationResponse,
            latestApplicationResponse,
          } = state

          const props = {
            canEdit: !!canEdit,
            linkToPage: `/application/${serial}/${sectionCode}/Page${pageNumber}`,
            summaryProps: getSummaryViewProps(element),
            latestApplicationResponse: latestApplicationResponse,
            previousApplicationResponse: previousApplicationResponse,
          }

          const changedQuestionResponse = !isChangeRequest && !isChanged

          return (
            <div key={`question_${element.id}`}>
              <Segment style={inlineStyles(isChangeRequest, isSummary)}>
                {element.category === TemplateElementCategory.Question ? (
                  changedQuestionResponse ? (
                    <SummaryResponseElement {...props} />
                  ) : (
                    <SummaryResponseChangedElement {...props} />
                  )
                ) : (
                  <SummaryInformationElement {...props} />
                )}
              </Segment>
              {isChangeRequest && <SummaryReviewResponseElement {...props} />}
            </div>
          )
        })}
      </Form>
    )
  }

  // TODO: Find out problem to display edit button with review responses when Review is locked

  if (isReview) {
    return (
      <Form>
        {visibleElements.map(
          ({
            element,
            thisReviewLatestResponse,
            isNewApplicationResponse,
            latestApplicationResponse,
          }) => {
            const props = {
              isNewApplicationResponse: !!isNewApplicationResponse,
              latestApplicationResponse: latestApplicationResponse,
              summaryProps: getSummaryViewProps(element),
              thisReviewLatestResponse: thisReviewLatestResponse,
            }

            const isChangeRequest: boolean = !!thisReviewLatestResponse?.decision

            return (
              <div key={`${element.code}ReviewContainer`}>
                <Segment key={`question_${element.id}`} style={inlineStyles(isChangeRequest)}>
                  {element.category === TemplateElementCategory.Question ? (
                    <ReviewResponseElement {...props} />
                  ) : (
                    <SummaryInformationElement {...props} />
                  )}
                </Segment>
                {thisReviewLatestResponse && (
                  <ReviewDecisionElement
                    latestApplicationResponse={latestApplicationResponse}
                    reviewResponse={thisReviewLatestResponse}
                    summaryViewProps={props.summaryProps}
                  />
                )}
              </div>
            )
          }
        )}
      </Form>
    )
  }
  return null
}

// Styles - TODO: Move to LESS || Global class style (semantic)
const inlineStyles = (isChangeRequest?: boolean, isSummary?: boolean) => ({
  background: isSummary && isChangeRequest ? 'rgb(249, 255, 255)' : '#FFFFFF',
  borderRadius: 8,
  borderBottomLeftRadius: isChangeRequest ? 0 : 8,
  borderBottomRightRadius: isChangeRequest ? 0 : 8,
  border: 'none',
  boxShadow: 'none',
  margin: 10,
  marginBottom: isChangeRequest ? 0 : 10,
})

export default PageElements
