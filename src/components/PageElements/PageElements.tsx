import React from 'react'
import { Form, Icon, Label, Segment } from 'semantic-ui-react'
import {
  ApplicationDetails,
  ElementState,
  PageElement,
  ResponsesByCode,
  SectionAndPage,
} from '../../utils/types'
import { ApplicationViewWrapper } from '../../formElementPlugins'
import { ApplicationViewWrapperProps } from '../../formElementPlugins/types'
import { ReviewResponse, TemplateElementCategory } from '../../utils/generated/graphql'
import Markdown from '../../utils/helpers/semanticReactMarkdown'
import HistoryPanel from '../Review/HistoryPanel'
import SummaryInformationElement from './Elements/SummaryInformationElement'
import ApplicantResponseElement from './Elements/ApplicantResponseElement'
import { useRouter } from '../../utils/hooks/useRouter'
import ConsolidateReviewDecision from './Elements/ConsolidateReviewDecision'
import ReviewApplicantResponse from './Elements/ReviewApplicantResponse'
import ReviewResponseElement from './Elements/ReviewResponseElement'
import strings from '../../utils/constants'

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
    query: { showHistory },
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
                    reviewerComment: currentReview?.comment || undefined,
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
          const {
            element,
            isChanged,
            isChangeRequest,
            latestApplicationResponse,
            previousApplicationResponse,
          } = state

          const isResponseUpdated = !!isChangeRequest || !!isChanged
          const reviewResponse = previousApplicationResponse?.reviewResponses.nodes[0]
          const canRenderReviewResponse = !!isChangeRequest && reviewResponse
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
            <RenderElementWrapper key={element.code}>
              <ApplicantResponseElement
                key="application-response"
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
              {canRenderReviewResponse && (
                <>
                  <ReviewResponseElement
                    key="review-response"
                    shouldDim={true}
                    shouldHideDecision={true}
                    isCurrentReview={false}
                    isConsolidation={false}
                    reviewResponse={reviewResponse as ReviewResponse}
                  />
                  {/* div below forced border on review response to be square */}
                  <div />
                </>
              )}
            </RenderElementWrapper>
          )
        })}
      </Form>
    )
  }

  // Review & Consolidation
  if (isReview) {
    return (
      <div className="flex-column">
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
              const toggleHistoryPanel = showHistory === element.code
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
                      showModal={() => updateQuery({ showHistory: element.code })}
                    />
                  ) : (
                    <ReviewApplicantResponse
                      applicationResponse={latestApplicationResponse}
                      summaryViewProps={summaryViewProps}
                      reviewResponse={thisReviewLatestResponse}
                      isActiveReviewResponse={!!isActiveReviewResponse}
                      isNewApplicationResponse={!!isNewApplicationResponse}
                      showModal={() => updateQuery({ showHistory: element.code })}
                    />
                  )}
                  {toggleHistoryPanel && thisReviewLatestResponse && (
                    <HistoryPanel
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

const RenderElementWrapper: React.FC = ({ children }) => (
  <Segment basic className="summary-page-element-container">
    {children}
  </Segment>
)

export const UpdateIcon: React.FC<{ onClick: Function }> = ({ onClick }) => (
  <Icon className="clickable" name="edit" size="large" color="blue" onClick={onClick} />
)

export const UpdatedLabel: React.FC = () => (
  <div className="updated-label">
    <Icon name="circle" size="tiny" color="blue" />
    <Label className="simple-label">
      <strong>{strings.LABEL_UPDATED}</strong>
    </Label>
  </div>
)

export default PageElements
