import {
  ReviewResponse,
  ReviewResponseDecision,
  ReviewResponseRecommendedApplicantVisibility,
  useUpdateReviewResponseMutation,
} from '../generated/graphql'

// below lines are used to get return type of the function that is returned by useUpdateReviewResponseMutation
type UseUpdateReviewMutationReturnType = ReturnType<typeof useUpdateReviewResponseMutation>
type PromiseReturnType = ReturnType<UseUpdateReviewMutationReturnType[0]>

// hook used to update review response, comment and decision, use as per type definition below
// also computes and updates recommendedApplicantVisibility
type UseUpdateReviewResponse = () => (reviewResponse: ReviewResponse) => PromiseReturnType

const useUpdateReviewResponse: UseUpdateReviewResponse = () => {
  const [updateReviewResponse] = useUpdateReviewResponseMutation()

  return async (reviewResponse) =>
    updateReviewResponse({
      variables: {
        id: reviewResponse.id,
        comment: reviewResponse.comment,
        decision: reviewResponse.decision,
        recommendedApplicantVisibility: computeVisibility(reviewResponse),
      },
    })
}

// is_visible_to_applicant is set by an action on back, it uses recomended_application_visibility of the
// last level review to determine what will be visible to application in LOQ
// we can add a checkbox in decision modal to determine this (thus logic is placed here)
const computeVisibility = (reviewResponse: ReviewResponse | undefined) => {
  // would rather computer this from actual review level, but dont' want to pass too far as props or rely on context
  if (!reviewResponse)
    return ReviewResponseRecommendedApplicantVisibility.OriginalResponseNotVisibleToApplicant

  const isLevelOne = reviewResponse.originalReviewResponseId === reviewResponse.id

  if (isLevelOne) {
    if (reviewResponse.decision === ReviewResponseDecision.Decline)
      return ReviewResponseRecommendedApplicantVisibility.OriginalResponseVisibleToApplicant

    return ReviewResponseRecommendedApplicantVisibility.OriginalResponseNotVisibleToApplicant
  }
  // consolidator
  if (
    reviewResponse.decision === ReviewResponseDecision.Agree &&
    reviewResponse.originalReviewResponse?.decision === ReviewResponseDecision.Decline
  )
    return ReviewResponseRecommendedApplicantVisibility.OriginalResponseVisibleToApplicant
  return ReviewResponseRecommendedApplicantVisibility.OriginalResponseNotVisibleToApplicant
}

export default useUpdateReviewResponse
