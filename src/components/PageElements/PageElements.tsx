import React, { ReactNode } from 'react'
import { Form, Icon, Label, Segment } from 'semantic-ui-react'
import {
  ApplicationDetails,
  ElementState,
  PageElement,
  ResponsesByCode,
  SectionAndPage,
  StageDetails,
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
  stages: StageDetails[]
  canEdit: boolean
  isConsolidation?: boolean
  isReview?: boolean
  isStrictPage?: boolean
  isSummary?: boolean
  isUpdating?: boolean
  // userLevel?: number
  serial?: string
  renderConfigElement?: (element: ElementState) => ReactNode
  sectionAndPage?: SectionAndPage
}

const PageElements: React.FC<PageElementProps> = ({
  elements,
  responsesByCode,
  applicationData,
  stages,
  canEdit = false,
  isConsolidation = false,
  isReview = false,
  isStrictPage = false,
  isSummary = false,
  isUpdating = false,
  renderConfigElement = () => null,

  // userLevel,
  serial,
  sectionAndPage,
}) => {
  const {
    push,
    query: { showHistory },
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
        {elements.map(({ element, isChangeRequest, isChanged, previousApplicationResponse }) => {
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
              {renderConfigElement(element)}
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
        })}
      </Form>
    )

  // Summary Page
  if (isSummary) {
    const { sectionCode, pageNumber } = sectionAndPage as SectionAndPage
    return (
      <div>
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
            // Applicant can edit the summary page when is first submission and a response has been added
            // Or when changes required for any question that have been updated (isUpdating true)
            const canApplicantEdit =
              canEdit && isUpdating ? isResponseUpdated : !!latestApplicationResponse?.value
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
              elementCode: element.code,
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
        {showHistory && (
          <HistoryPanel
            templateCode={applicationData.template.code}
            stages={stages}
            isApplicant={true}
          />
        )}
      </div>
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
              const summaryViewProps = getSummaryViewProps(element)

              // Information - no review
              if (element.category === TemplateElementCategory.Information)
                return (
                  <RenderElementWrapper key={element.code}>
                    <SummaryInformationElement {...summaryViewProps} />
                  </RenderElementWrapper>
                )

              const props = {
                elementCode: element.code,
                applicationResponse: latestApplicationResponse,
                reviewResponse: thisReviewLatestResponse,
                previousReviewResponse: thisReviewPreviousResponse,
                isActiveReviewResponse: !!isActiveReviewResponse,
                enableViewHistory,
                summaryViewProps: summaryViewProps,
                stageNumber: applicationData.current.stage.number,
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
                </RenderElementWrapper>
              )
            }
          )}
        </Form>
        {showHistory && (
          <HistoryPanel
            templateCode={applicationData.template.code}
            stages={stages}
            // userLevel={userLevel || 1 + 1} // Get reviews for current level and level+1
          />
        )}
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
