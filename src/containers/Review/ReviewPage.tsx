import React, { useState } from 'react'
import { Button, Icon, Label, Message, ModalProps } from 'semantic-ui-react'
import {
  Loading,
  ConsolidationSectionProgressBar,
  ReviewHeader,
  ReviewSectionProgressBar,
  SectionWrapper,
  ModalWarning,
} from '../../components'
import { ReviewByLabel, ConsolidationByLabel } from '../../components/Review/ReviewLabel'
import {
  AssignmentDetails,
  FullStructure,
  Page,
  ResponsesByCode,
  SectionAssignment,
  SectionState,
} from '../../utils/types'
import {
  ReviewResponseDecision,
  ReviewResponseStatus,
  ReviewStatus,
  useUpdateReviewResponseMutation,
} from '../../utils/generated/graphql'
import strings from '../../utils/constants'
import useGetReviewStructureForSections from '../../utils/hooks/useGetReviewStructureForSection'
import useQuerySectionActivation from '../../utils/hooks/useQuerySectionActivation'
import useScrollableAttachments, {
  ScrollableAttachment,
} from '../../utils/hooks/useScrollableAttachments'
import ReviewSubmit from './ReviewSubmit'
import { useUserState } from '../../contexts/UserState'
import { useRouter } from '../../utils/hooks/useRouter'
import messages from '../../utils/messages'

const ReviewPage: React.FC<{
  reviewAssignment: AssignmentDetails
  fullApplicationStructure: FullStructure
}> = ({ reviewAssignment, fullApplicationStructure }) => {
  const {
    userState: { currentUser },
  } = useUserState()

  const { push } = useRouter()

  const { fullReviewStructure, error } = useGetReviewStructureForSections({
    reviewAssignment,
    fullApplicationStructure,
  })

  const { isSectionActive, toggleSection } = useQuerySectionActivation({
    defaultActiveSectionCodes: [],
  })

  const { addScrollable, scrollTo } = useScrollableAttachments()

  const [showWarningModal, setShowWarningModal] = useState<ModalProps>({ open: false })

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error]} />
  if (!fullReviewStructure) return <Loading />

  // TODO decide how to handle this, and localise if not deleted
  if (
    reviewAssignment?.reviewer?.id !== currentUser?.userId &&
    fullReviewStructure?.thisReview?.current.reviewStatus !== ReviewStatus.Submitted
  ) {
    const {
      info: {
        name,
        current: { stage },
      },
    } = fullReviewStructure
    return (
      <>
        <ReviewHeader applicationName={name} stage={stage} />
        <Label className="simple-label" content={strings.LABEL_REVIEW_IN_PROGRESS} />
      </>
    )
  }

  const {
    sections,
    responsesByCode,
    info: {
      serial,
      name,
      current: { stage },
    },
    thisReview,
    attemptSubmission,
    firstIncompleteReviewPage,
  } = fullReviewStructure

  if (
    thisReview?.current.reviewStatus === ReviewStatus.Pending &&
    showWarningModal.open === false
  ) {
    const { title, message, option } = messages.REVIEW_STATUS_PENDING
    setShowWarningModal({
      open: true,
      title,
      message,
      option,
      onClick: () => {
        setShowWarningModal({ open: false })
        push(`/application/${fullReviewStructure.info.serial}/review`)
      },
      onClose: () => {
        setShowWarningModal({ open: false })
        push(`/application/${fullReviewStructure.info.serial}/review`)
      },
    })
  }

  const isMissingReviewResponses = (section: string): boolean =>
    attemptSubmission && firstIncompleteReviewPage?.sectionCode === section

  const isAssignedToCurrentUser = Object.values(sections).some(
    (section) => section.assignment?.isAssignedToCurrentUser
  )

  const isConsolidation = Object.values(sections).some(
    (section) => section.assignment?.isConsolidation
  )

  return error ? (
    <Message error title={strings.ERROR_GENERIC} list={[error]} />
  ) : (
    <>
      <ReviewHeader applicationName={name} stage={stage} />
      <div style={{ display: 'flex' }}>
        {isConsolidation ? (
          isAssignedToCurrentUser ? (
            <ConsolidationByLabel />
          ) : (
            <ConsolidationByLabel user={thisReview?.reviewer} />
          )
        ) : isAssignedToCurrentUser ? (
          <ReviewByLabel />
        ) : (
          <ReviewByLabel user={thisReview?.reviewer} />
        )}
      </div>
      <div id="application-summary-content">
        {Object.values(sections).map((section) => (
          <SectionWrapper
            key={`ApplicationSection_${section.details.id}`}
            isActive={isSectionActive(section.details.code)}
            toggleSection={toggleSection(section.details.code)}
            section={section}
            isSectionInvalid={isMissingReviewResponses(section.details.code)}
            extraSectionTitleContent={(section: SectionState) => (
              <div>
                {isMissingReviewResponses(section.details.code) && (
                  <Label
                    icon={<Icon name="exclamation circle" color="pink" />}
                    className="simple-label alert-text"
                    content={strings.LABEL_REVIEW_SECTION}
                  />
                )}
                <SectionRowStatus {...section} />
              </div>
            )}
            extraPageContent={(page: Page) => (
              <ApproveAllButton
                isConsolidation={!!section.assignment?.isConsolidation}
                stageNumber={stage.number}
                page={page}
              />
            )}
            scrollableAttachment={(page: Page) => (
              <ScrollableAttachment
                code={`${section.details.code}P${page.number}`}
                addScrollabe={addScrollable}
              />
            )}
            responsesByCode={responsesByCode as ResponsesByCode}
            applicationData={fullApplicationStructure.info}
            stages={fullApplicationStructure.stages}
            serial={serial}
            isReview
            isConsolidation={section.assignment?.isConsolidation}
            canEdit={
              reviewAssignment?.review?.current.reviewStatus === ReviewStatus.Draft ||
              reviewAssignment?.review?.current.reviewStatus === ReviewStatus.Locked
            }
          />
        ))}
        <ReviewSubmit
          structure={fullReviewStructure}
          assignment={reviewAssignment}
          scrollTo={scrollTo}
        />
      </div>
      <ModalWarning {...showWarningModal} />
    </>
  )
}

const SectionRowStatus: React.FC<SectionState> = (section) => {
  const { assignment } = section
  const { isConsolidation, isReviewable, isAssignedToCurrentUser } = assignment as SectionAssignment

  if (!isAssignedToCurrentUser)
    return <Label className="simple-label" content={strings.LABEL_ASSIGNED_TO_OTHER} />
  if (!isReviewable)
    return (
      <Label
        icon={<Icon name="circle" size="mini" color="blue" />}
        content={strings.LABEL_ASSIGNED_TO_YOU}
      />
    )
  if (isConsolidation && section.consolidationProgress)
    return <ConsolidationSectionProgressBar consolidationProgress={section.consolidationProgress} />
  if (section.reviewProgress)
    return <ReviewSectionProgressBar reviewProgress={section.reviewProgress} />
  return null // Unexpected
}

interface ApproveAllButtonProps {
  isConsolidation: boolean
  stageNumber: number
  page: Page
}

const ApproveAllButton: React.FC<ApproveAllButtonProps> = ({
  isConsolidation,
  stageNumber,
  page,
}) => {
  const [updateReviewResponse] = useUpdateReviewResponseMutation()

  const reviewResponses = page.state.map((element) => element.thisReviewLatestResponse)

  const responsesToReview = reviewResponses.filter(
    (reviewResponse) => reviewResponse && !reviewResponse?.decision
  )

  const massApprove = () => {
    responsesToReview.forEach((reviewResponse) => {
      if (!reviewResponse) return
      updateReviewResponse({
        variables: {
          id: reviewResponse.id,
          decision: isConsolidation ? ReviewResponseDecision.Agree : ReviewResponseDecision.Approve,
          stageNumber,
        },
      })
    })
  }

  if (responsesToReview.length === 0) return null
  if (responsesToReview.some((response) => response?.status !== ReviewResponseStatus.Draft))
    return null

  return (
    <div className="right-justify-content review-approve-all-button">
      <Button
        primary
        inverted
        onClick={massApprove}
        content={`${
          isConsolidation ? strings.BUTTON_REVIEW_AGREE_ALL : strings.BUTTON_REVIEW_APPROVE_ALL
        } (${responsesToReview.length})`}
      />
    </div>
  )
}

export default ReviewPage
