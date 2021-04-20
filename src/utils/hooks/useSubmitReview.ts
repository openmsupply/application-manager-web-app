import {
  useUpdateReviewMutation,
  Decision,
  ReviewPatch,
  ReviewResponseStatus,
  Trigger,
} from '../generated/graphql'
import { FullStructure } from '../types'

// below lines are used to get return type of the function that is returned by useUpdateReviewMutation
type UseUpdateReviewMutationReturnType = ReturnType<typeof useUpdateReviewMutation>
type PromiseReturnType = ReturnType<UseUpdateReviewMutationReturnType[0]>
// hook used to submit review, , as per type definition below (returns promise that resolve with mutation result data)
type UseSubmitReview = (
  reviewId: number
) => (structure: FullStructure, decision: Decision) => PromiseReturnType

type ConstructReviewPatch = (structure: FullStructure, decision: Decision) => ReviewPatch

const useSubmitReview: UseSubmitReview = (reviewId) => {
  const [updateReview] = useUpdateReviewMutation()

  const constructReviewPatch: ConstructReviewPatch = (structure, decision) => {
    const reviewResponses = Object.values(structure?.elementsById || []).filter(
      (element) => element.thisReviewLatestResponse
    )

    const reviewResponsesPatches = reviewResponses.map(({ thisReviewLatestResponse }) => ({
      patch: {
        decision: thisReviewLatestResponse?.decision,
        comment: thisReviewLatestResponse?.comment,
        status: ReviewResponseStatus.Submitted,
        recommendedApplicationVisibility: thisReviewLatestResponse?.recommendedApplicantVisibility,
      },
      id: Number(thisReviewLatestResponse?.id),
    }))

    const reviewDecision = structure.thisReview?.reviewDecision

    const reviewDecisionPatch = {
      id: Number(reviewDecision?.id),
      patch: {
        comment: reviewDecision?.comment || undefined,
        decision: decision,
      },
    }

    return {
      trigger: Trigger.OnReviewSubmit,
      reviewResponsesUsingId: {
        updateById: reviewResponsesPatches,
      },
      reviewDecisionsUsingId: {
        updateById: [reviewDecisionPatch],
      },
    }
  }

  const submitReview = async (structure: FullStructure, decision: Decision) =>
    updateReview({
      variables: {
        reviewId: reviewId,
        reviewPatch: constructReviewPatch(structure, decision),
      },
    })

  return submitReview
}

export default useSubmitReview
