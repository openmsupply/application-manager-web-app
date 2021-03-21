import { Button, Container, Header, Label, Message, Segment } from 'semantic-ui-react'
import { Loading } from '../../components'
import {
  AssignmentDetailsNEW,
  FullStructure,
  PageNEW,
  ResponsesByCode,
  SectionStateNEW,
} from '../../utils/types'

import {
  ReviewResponseDecision,
  ReviewResponseStatus,
  ReviewStatus,
  useUpdateReviewResponseMutation,
} from '../../utils/generated/graphql'
import strings from '../../utils/constants'

import useGetFullReviewStructure from '../../utils/hooks/useGetFullReviewStructure'
import SectionWrapper from '../../components/Application/SectionWrapper'
import React from 'react'
import useQuerySectionActivation from '../../utils/hooks/useQuerySectionActivation'

import useScrollableAttachments, {
  ScrollableAttachment,
} from '../../utils/hooks/useScrollableAttachments'
import { SectionProgress } from '../../components/Review'
import ReviewSubmit from './ReviewSubmit'
import { useUserState } from '../../contexts/UserState'

const ReviewPage: React.FC<{
  reviewAssignment: AssignmentDetailsNEW
  fullApplicationStructure: FullStructure
}> = ({ reviewAssignment, fullApplicationStructure }) => {
  const {
    userState: { currentUser },
  } = useUserState()

  const { fullReviewStructure, error } = useGetFullReviewStructure({
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

  const { sections, responsesByCode, info } = fullReviewStructure
  return (
    <Container style={{ paddingBottom: 50, paddingTop: 25, background: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <Label
          style={
            fullApplicationStructure?.info?.current?.stage?.name === 'Assessment'
              ? {
                  color: 'white',
                  background: 'rgb(86, 180, 219)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.81px',
                }
              : {
                  color: 'white',
                  background: 'rgb(225, 126, 72)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.81px',
                }
          }
        >
          {fullApplicationStructure?.info?.current?.stage?.name}
        </Label>
      </div>
      <Header
        textAlign="center"
        style={{ margin: 3, padding: 5 }}
        content={fullApplicationStructure.info.name}
        subheader={strings.DATE_APPLICATION_PLACEHOLDER}
      />

      <Header
        as="h1"
        textAlign="center"
        style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1, marginBottom: 4, marginTop: 5 }}
        content="REVIEW"
      />

      <Header
        textAlign="center"
        style={{ marginTop: 4, color: '#4A4A4A', fontSize: 16, letterSpacing: 0.36 }}
        as="h3"
      >
        {strings.SUBTITLE_REVIEW}
      </Header>
      <Segment
        className="sup"
        style={{
          background: 'white',
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
          paddingTop: 25,
        }}
      >
        {Object.values(sections).map((section) => (
          <SectionWrapper
            key={`ApplicationSection_${section.details.id}`}
            isActive={isSectionActive(section.details.code)}
            toggleSection={toggleSection(section.details.code)}
            section={section}
            extraSectionTitleContent={(section: SectionStateNEW) => (
              <SectionProgress {...section} />
            )}
            extraPageContent={(page: PageNEW) => <ApproveAllButton page={page} />}
            scrollableAttachment={(page: PageNEW) => (
              <ScrollableAttachment
                code={`${section.details.code}P${page.number}`}
                addScrollabe={addScrollable}
              />
            )}
            responsesByCode={responsesByCode as ResponsesByCode}
            serial={info.serial}
            isReview
            canEdit={
              reviewAssignment?.review?.status === ReviewStatus.Draft ||
              reviewAssignment?.review?.status === ReviewStatus.Locked
            }
          />
        ))}
      </Segment>

      <Container
        style={{
          background: 'white',
          position: 'fixed',
          bottom: 65,
          left: 0,
          right: 0,
          boxShadow: '0px -6px 3px -3px #AAAAAA',
          paddingTop: 10,
          zIndex: 1000,
        }}
      >
        <ReviewSubmit
          structure={fullReviewStructure}
          reviewAssignment={reviewAssignment}
          scrollTo={scrollTo}
        />
      </Container>
    </Container>
  )
}

const ApproveAllButton: React.FC<{ page: PageNEW }> = ({ page }) => {
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
    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 20 }}>
      <Button
        style={{
          background: 'none',
          color: '#003BFE',
          letterSpacing: 1.4,
          border: '2px solid #003BFE',
          borderRadius: 8,
          textTransform: 'capitalize',
        }}
        onClick={massApprove}
      >{`${strings.BUTTON_REVIEW_APPROVE_ALL} (${responsesToReview.length})`}</Button>
    </div>
  )
}

export default ReviewPage
