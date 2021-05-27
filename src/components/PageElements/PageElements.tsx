import React from 'react'
import { Form, Icon, Segment } from 'semantic-ui-react'
import {
  ApplicationDetails,
  ElementState,
  PageElement,
  ResponsesByCode,
  SectionAndPage,
} from '../../utils/types'
import { ApplicationViewWrapper } from '../../formElementPlugins'
import { ApplicationViewWrapperProps } from '../../formElementPlugins/types'
import { TemplateElementCategory } from '../../utils/generated/graphql'
import Markdown from '../../utils/helpers/semanticReactMarkdown'
import DecisionArea from '../Review/DecisionArea'
import SummaryInformationElement from './Elements/SummaryInformationElement'
import ApplicantResponseElement from './Elements/ApplicantResponseElement'
import { useRouter } from '../../utils/hooks/useRouter'
import ConsolidateReviewDecision from './Elements/ConsolidateReviewDecision'
import ReviewApplicantResponse from './Elements/ReviewApplicantResponse'

interface PageElementProps {
  elements: PageElement[]
  responsesByCode: ResponsesByCode
  applicationData: ApplicationDetails
  canEdit: boolean
  isConsolidation?: boolean
  isReview?: boolean
  isStrictPage?: boolean
  isSummary?: boolean
  isUpdating?: boolean
  serial?: string
  sectionAndPage?: SectionAndPage
}

const PageElements: React.FC<PageElementProps> = ({
  elements,
  responsesByCode,
  applicationData,
  canEdit = false,
  isConsolidation = false,
  isReview = false,
  isStrictPage = false,
  isSummary = false,
  isUpdating = false,
  serial,
  sectionAndPage,
}) => {
  const {
    push,
    query: { openResponse },
    updateQuery,
  } = useRouter()
  const visibleElements = elements.filter(({ element }) => element.isVisible)

  // Editable Application page
  if (canEdit && !isReview && !isSummary)
    return (
      <Form className="form-area">
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
            return (
              <div className="form-element-wrapper" key={`question_${element.code}`}>
                <div className="form-element">
                  <ApplicationViewWrapper {...props} />
                </div>
                {element.helpText && (
                  <div className="help-tips hide-on-mobile">
                    <div className="help-tips-content">
                      <Markdown text={element.helpText} />
                    </div>
                  </div>
                )}
              </div>
            )
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
          const { element, isChanged, isChangeRequest, latestApplicationResponse } = state

          const isResponseUpdated = !!isChangeRequest || !!isChanged

          // Applicant can edit the summary page when is first submission (canEdit true when draft)
          // Or when changes required for any question that have been updated (isUpdating true)
          const canApplicantEdit = isUpdating ? isResponseUpdated && canEdit : canEdit
          const summaryViewProps = getSummaryViewProps(element)

          if (element.category === TemplateElementCategory.Information) {
            return (
              <RenderElementWrapper key={element.code}>
                <SummaryInformationElement {...summaryViewProps} />
              </RenderElementWrapper>
            )
          }
          return (
            <RenderElementWrapper key={element.code} isResponseUpdated={isResponseUpdated}>
              <ApplicantResponseElement
                applicationResponse={latestApplicationResponse}
                summaryViewProps={summaryViewProps}
                isResponseUpdated={isResponseUpdated}
              >
                {canApplicantEdit && (
                  <UpdateIcon
                    onClick={() => push(`/application/${serial}/${sectionCode}/Page${pageNumber}`)}
                  />
                )}
              </ApplicantResponseElement>
            </RenderElementWrapper>
          )
        })}
      </Form>
    )
  }

  // Review & Consolidation
  if (isReview) {
    return (
      <div>
        <Form>
          {visibleElements.map(
            ({
              element,
              thisReviewLatestResponse,
              isNewApplicationResponse,
              isActiveReviewResponse,
              latestApplicationResponse,
              latestOriginalReviewResponse,
            }) => {
              const toggleDecision = openResponse === element.code
              const summaryViewProps = getSummaryViewProps(element)

              // Information - no review
              if (element.category === TemplateElementCategory.Information)
                return (
                  <RenderElementWrapper key={element.code}>
                    <SummaryInformationElement {...summaryViewProps} />
                  </RenderElementWrapper>
                )

              return (
                <RenderElementWrapper key={element.code}>
                  {isConsolidation ? (
                    <ConsolidateReviewDecision
                      applicationResponse={latestApplicationResponse}
                      summaryViewProps={summaryViewProps}
                      reviewResponse={thisReviewLatestResponse}
                      originalReviewResponse={latestOriginalReviewResponse}
                      isActiveReviewResponse={!!isActiveReviewResponse}
                      isNewApplicationResponse={!!isNewApplicationResponse}
                      showModal={() => updateQuery({ openResponse: element.code })}
                    />
                  ) : (
                    <ReviewApplicantResponse
                      applicationResponse={latestApplicationResponse}
                      summaryViewProps={summaryViewProps}
                      reviewResponse={thisReviewLatestResponse}
                      isActiveReviewResponse={!!isActiveReviewResponse}
                      isNewApplicationResponse={!!isNewApplicationResponse}
                      showModal={() => updateQuery({ openResponse: element.code })}
                    />
                  )}
                  {toggleDecision && thisReviewLatestResponse && (
                    <DecisionArea
                      isConsolidation={isConsolidation}
                      reviewResponse={thisReviewLatestResponse}
                      summaryViewProps={summaryViewProps}
                    />
                  )}
                </RenderElementWrapper>
              )
            }
          )}
        </Form>
      </div>
    )
  }

  return null
}

interface RenderElementWrapperProps {
  isResponseUpdated?: boolean
}
const RenderElementWrapper: React.FC<RenderElementWrapperProps> = ({
  isResponseUpdated = false,
  children,
}) => {
  const backgroundColour = isResponseUpdated ? 'changeable-background' : ''
  return (
    <Segment basic className={`summary-page-element ${backgroundColour}`}>
      {children}
    </Segment>
  )
}

const UpdateIcon: React.FC<{ onClick: Function }> = ({ onClick }) => (
  <Icon className="clickable" name="pencil" size="large" color="blue" onClick={onClick} />
)

export default PageElements
