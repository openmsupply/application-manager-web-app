import React from 'react'
import { Container, Form, Header, Label, Message } from 'semantic-ui-react'
import { Loading, ReviewSection } from '../../components'
import strings from '../../utils/constants'
import { ReviewQuestionDecision } from '../../utils/types'
import useLoadReview from '../../utils/hooks/useLoadReview'
import { useRouter } from '../../utils/hooks/useRouter'
import { useUpdateReviewResponseMutation } from '../../utils/generated/graphql'
import getReviewQuery from '../../utils/graphql/queries/getReview.query'

const ReviewPageWrapper: React.FC = () => {
  const {
    params: { serialNumber, reviewId },
  } = useRouter()

  // Will wait for trigger to run that will set the Review status as DRAFT (after creation)
  const { error, loading, applicationName, responsesByCode, reviewSections } = useLoadReview({
    reviewId: Number(reviewId),
    serialNumber,
  })

  const [updateReviewResponse] = useUpdateReviewResponseMutation({
    onCompleted: ({ updateReviewResponse }) =>
      console.log('Success to update reviewResponse: ', updateReviewResponse?.clientMutationId),
    onError: (error) => console.log('Problem to update reviewResponse', error.message),
    refetchQueries: [
      {
        query: getReviewQuery,
        variables: { reviewId: Number(reviewId), serialNumber },
      },
    ],
  })

  const updateResponses = (array: ReviewQuestionDecision[]) => {
    array.forEach((reviewResponse) => {
      updateReviewResponse({ variables: { ...reviewResponse } })
    })
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
        {reviewSections.map((reviewSection) => (
          <ReviewSection
            key={`Review_${reviewSection.section.code}`}
            allResponses={responsesByCode}
            reviewSection={reviewSection}
            updateResponses={updateResponses}
            canEdit={true} // TODO: Check Review status
          />
        ))}
      </Form>
    </>
  ) : (
    <Message error header={strings.ERROR_REVIEW_PAGE} />
  )
}

export default ReviewPageWrapper
