import React, { CSSProperties } from 'react'
import { Button, Header, Message, Segment } from 'semantic-ui-react'
import { Loading, SectionWrapper } from '../../components'
import {
  AssignmentDetails,
  FullStructure,
  Page,
  ResponsesByCode,
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
import { ReviewHeader, SectionProgress } from '../../components/Review'
import ReviewSubmit from './ReviewSubmit'
import { useUserState } from '../../contexts/UserState'

const ReviewPage: React.FC<{
  reviewAssignment: AssignmentDetails
  fullApplicationStructure: FullStructure
}> = ({ reviewAssignment, fullApplicationStructure }) => {
  const {
    userState: { currentUser },
  } = useUserState()

  const { fullReviewStructure, error } = useGetReviewStructureForSections({
    reviewAssignment,
    fullApplicationStructure,
  })

  const { isSectionActive, toggleSection } = useQuerySectionActivation({
    defaultActiveSectionCodes: [],
  })

  const { addScrollable, scrollTo } = useScrollableAttachments()

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error]} />
  if (!fullReviewStructure) return <Loading />

  // TODO decide how to handle this, and localise if not deleted
  if (
    reviewAssignment?.reviewer?.id !== currentUser?.userId &&
    fullReviewStructure?.thisReview?.status !== ReviewStatus.Submitted
  )
    return <Header>Review in Progress</Header>

  const {
    sections,
    responsesByCode,
    info: {
      serial,
      current: { stage },
      name,
    },
  } = fullReviewStructure

  const ReviewMain: React.FC = () => (
    <>
      <Segment className="sup" style={inlineStyles.top}>
        {Object.values(sections).map((section) => (
          <SectionWrapper
            key={`ApplicationSection_${section.details.id}`}
            isActive={isSectionActive(section.details.code)}
            toggleSection={toggleSection(section.details.code)}
            section={section}
            extraSectionTitleContent={(section: SectionState) => <SectionProgress {...section} />}
            extraPageContent={(page: Page) => <ApproveAllButton page={page} />}
            scrollableAttachment={(page: Page) => (
              <ScrollableAttachment
                code={`${section.details.code}P${page.number}`}
                addScrollabe={addScrollable}
              />
            )}
            responsesByCode={responsesByCode as ResponsesByCode}
            applicationData={fullApplicationStructure.info}
            serial={serial}
            isReview
            canEdit={
              reviewAssignment?.review?.status === ReviewStatus.Draft ||
              reviewAssignment?.review?.status === ReviewStatus.Locked
            }
          />
        ))}
      </Segment>
      <Segment basic style={inlineStyles.bot}>
        <ReviewSubmit
          structure={fullReviewStructure}
          reviewAssignment={reviewAssignment}
          scrollTo={scrollTo}
        />
      </Segment>
    </>
  )

  return error ? (
    <Message error title={strings.ERROR_GENERIC} list={[error]} />
  ) : (
    <ReviewHeader
      applicationStage={stage.name || ''}
      applicationName={name}
      currentUser={currentUser}
      ChildComponent={ReviewMain}
    />
  )
}

const ApproveAllButton: React.FC<{ page: Page }> = ({ page }) => {
  const [updateReviewResponse] = useUpdateReviewResponseMutation()

  const reviewResponses = page.state.map((element) => element.thisReviewLatestResponse)

  const responsesToReview = reviewResponses.filter(
    (reviewResponse) => reviewResponse && !reviewResponse?.decision
  )

  const massApprove = () => {
    responsesToReview.forEach((reviewResponse) => {
      if (!reviewResponse) return
      updateReviewResponse({
        variables: { id: reviewResponse.id, decision: ReviewResponseDecision.Approve },
      })
    })
  }

  if (responsesToReview.length === 0) return null
  if (responsesToReview.some((response) => response?.status !== ReviewResponseStatus.Draft))
    return null

  return (
    <div style={inlineStyles.button}>
      <Button
        style={inlineStyles.approve}
        onClick={massApprove}
        content={`${strings.BUTTON_REVIEW_APPROVE_ALL} (${responsesToReview.length})`}
      />
    </div>
  )
}

// Styles - TODO: Move to LESS || Global class style (semantic)
const inlineStyles = {
  top: {
    background: 'white',
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    paddingTop: 25,
  } as CSSProperties,
  bot: {
    marginLeft: '10%',
    marginRight: '10%',
  } as CSSProperties,
  button: { display: 'flex', justifyContent: 'flex-end', paddingRight: 20 } as CSSProperties,
  approve: {
    background: 'none',
    color: '#003BFE',
    letterSpacing: 1.4,
    border: '2px solid #003BFE',
    borderRadius: 8,
    textTransform: 'capitalize',
  } as CSSProperties,
}

export default ReviewPage
