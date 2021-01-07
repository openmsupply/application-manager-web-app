import React, { useState } from 'react'
import { Container, Form, Header, Label, Message } from 'semantic-ui-react'
import { DecisionArea, Loading, ReviewSection } from '../../components'
import { DecisionAreaState, ReviewQuestionDecision, User } from '../../utils/types'
import useLoadReview from '../../utils/hooks/useLoadReview'
import { useRouter } from '../../utils/hooks/useRouter'
import { useUpdateReviewResponseMutation } from '../../utils/generated/graphql'
import getReviewQuery from '../../utils/graphql/queries/getReview.query'
import strings from '../../utils/constants'
import { SummaryViewWrapperProps } from '../../formElementPlugins/types'
import { useUserState } from '../../contexts/UserState'

const decisionAreaInitialState = { open: false, review: null, summaryViewProps: null }

const ReviewPageWrapper: React.FC = () => {
  const {
    params: { serialNumber, reviewId },
  } = useRouter()
  const {
    userState: { currentUser },
  } = useUserState()
  const [decisionState, setDecisionState] = useState<DecisionAreaState>(decisionAreaInitialState)
  const { review } = decisionState

  // Will wait for trigger to run that will set the Review status as DRAFT (after creation)
  const { error, loading, applicationName, responsesByCode, reviewSections } = useLoadReview({
    reviewId: Number(reviewId),
    serialNumber,
  })

  const [updateReviewResponse] = useUpdateReviewResponseMutation({
    onCompleted: ({ updateReviewResponse }) =>
      console.log('Success to update reviewResponse: ', updateReviewResponse?.clientMutationId),
    onError: (error) => console.log('Problem updating reviewResponse', error.message),
    refetchQueries: [
      {
        query: getReviewQuery,
        variables: { reviewId: Number(reviewId), serialNumber },
      },
    ],
  })

  const updateResponses = async (array: ReviewQuestionDecision[]) => {
    array.forEach((reviewResponse) => {
      updateReviewResponse({ variables: { ...reviewResponse } })
    })
  }

  const openDecisionArea = (
    review: ReviewQuestionDecision,
    summaryViewProps: SummaryViewWrapperProps
  ) => {
    setDecisionState({
      open: true,
      review: {
        id: review.id,
        decision: review.decision,
        comment: review.comment,
      },
      summaryViewProps,
    })
  }

  const submitResponseHandler = (_: any) => {
    if (review) {
      const { id, comment, decision } = review

      updateReviewResponse({ variables: { ...review } })
      setDecisionState(decisionAreaInitialState)
    }
  }

  return error ? (
    <Message error header={strings.ERROR_REVIEW_PAGE} list={[error]} />
  ) : loading ? (
    <Loading />
  ) : reviewSections && responsesByCode ? (
    <>
      <Container text textAlign="center">
        <Label color="blue">{strings.STAGE_PLACEHOLDER}</Label>
        <Header content={applicationName} subheader={strings.DATE_APPLICATION_PLACEHOLDER} />
        <Header
          as="h3"
          color="grey"
          content={strings.TITLE_REVIEW_SUMMARY}
          subheader={strings.SUBTITLE_REVIEW}
        />
      </Container>

      <Form>
        {reviewSections.map((reviewSection) => {
          const { id, firstName, lastName } = currentUser as User
          const assignedToYou = reviewSection.assigned?.id === id
          return (
            <ReviewSection
              key={`Review_${reviewSection.section.code}`}
              reviewer={`${firstName} ${lastName}`}
              allResponses={responsesByCode}
              assignedToYou={assignedToYou}
              reviewSection={reviewSection}
              updateResponses={updateResponses}
              setDecisionArea={openDecisionArea}
              canEdit={true} // TODO: Check Review status
            />
          )
        })}
      </Form>
      <DecisionArea
        state={decisionState}
        setDecision={setDecisionState}
        submitHandler={submitResponseHandler}
      />
    </>
  ) : (
    <Message error header={strings.ERROR_REVIEW_PAGE} />
  )
}

export default ReviewPageWrapper
