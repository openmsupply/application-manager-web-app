import React from 'react'
import { Form, Icon, Label, Segment } from 'semantic-ui-react'
import {
  ApplicationDetails,
  ElementState,
  PageElement,
  ResponsesByCode,
  SectionAndPage,
} from '../../utils/types'
import { ApplicationViewWrapper, SummaryViewWrapper } from '../../formElementPlugins'
import { ApplicationViewWrapperProps } from '../../formElementPlugins/types'
import { ReviewResponse, TemplateElementCategory } from '../../utils/generated/graphql'
import Markdown from '../../utils/helpers/semanticReactMarkdown'
import HistoryPanel from '../Review/HistoryPanel'
import SummaryInformationElement from './Elements/SummaryInformationElement'
import ApplicantElementWrapper from './Elements/ApplicantElementWrapper'
import ConsolidateReviewDecision from './Elements/ConsolidateReviewDecision'
import ReviewApplicantResponse from './Elements/ReviewApplicantResponse'
import { useRouter } from '../../utils/hooks/useRouter'
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

  const getSummaryViewProps = (element: ElementState) => ({
    element,
    response: responsesByCode?.[element.code],
    allResponses: responsesByCode,
    applicationData,
  })
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
                  {element.category === TemplateElementCategory.Information ? (
                    <RenderElementWrapper key={element.code}>
                      <SummaryViewWrapper {...getSummaryViewProps(element)} />
                    </RenderElementWrapper>
                  ) : (
                    <ApplicationViewWrapper {...props} />
                  )}
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
            enableViewHistory,
            latestApplicationResponse,
            previousApplicationResponse,
          } = state

          const isResponseUpdated = !!isChangeRequest || !!isChanged
          // Applicant can edit the summary page when is first submission (canEdit true when draft)
          // Or when changes required for any question that have been updated (isUpdating true)
          const canApplicantEdit = isUpdating ? isResponseUpdated && canEdit : canEdit
          const reviewResponse = previousApplicationResponse?.reviewResponses.nodes[0]
          const summaryViewProps = getSummaryViewProps(element)

          if (element.category === TemplateElementCategory.Information) {
            return (
              <RenderElementWrapper key={element.code}>
                <SummaryInformationElement {...summaryViewProps} />
              </RenderElementWrapper>
            )
          }

          const props = {
            latestApplicationResponse,
            previousApplicationResponse,
            summaryViewProps,
            reviewResponse: reviewResponse as ReviewResponse,
            canApplicantEdit,
            enableViewHistory,
            isChanged,
            isChangeRequest,
            updateMethod: () => push(`/application/${serial}/${sectionCode}/Page${pageNumber}`),
          }

          return (
            <RenderElementWrapper key={element.code}>
              <ApplicantElementWrapper {...props} />
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
              thisReviewPreviousResponse,
              isNewApplicationResponse,
              isNewReviewResponse,
              isActiveReviewResponse,
              enableViewHistory,
              isChangeRequest,
              isChanged,
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

              const props = {
                applicationResponse: latestApplicationResponse,
                reviewResponse: thisReviewLatestResponse,
                previousReviewResponse: thisReviewPreviousResponse,
                isActiveReviewResponse: !!isActiveReviewResponse,
                enableViewHistory,
                showModal: () => updateQuery({ showHistory: element.code }),
                summaryViewProps: summaryViewProps,
              }

              return (
                <RenderElementWrapper key={element.code}>
                  {isConsolidation ? (
                    <ConsolidateReviewDecision
                      {...props}
                      isNewReviewResponse={!!isNewReviewResponse}
                      originalReviewResponse={latestOriginalReviewResponse}
                    />
                  ) : (
                    <ReviewApplicantResponse
                      {...props}
                      isNewApplicationResponse={!!isNewApplicationResponse}
                      isChangeRequest={!!isChangeRequest}
                      isChanged={!!isChanged}
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

const RenderElementWrapper: React.FC<{ extraSpacing?: boolean }> = ({ children, extraSpacing }) => (
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
      <strong>{strings.LABEL_RESPONSE_UPDATED}</strong>
    </Label>
  </div>
)

export default PageElements
