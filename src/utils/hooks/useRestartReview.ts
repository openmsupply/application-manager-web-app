import { useUpdateReviewMutation, ReviewPatch, Trigger } from '../generated/graphql'
import { FullStructure } from '../types'

// below lines are used to get return type of the function that is returned by useRestartReviewMutation
type UseUpdateReviewMutationReturnType = ReturnType<typeof useUpdateReviewMutation>
type PromiseReturnType = ReturnType<UseUpdateReviewMutationReturnType[0]>
// hook used to restart a review, , as per type definition below (returns promise that resolve with mutation result data)
type UseRestartReview = (reviewId: number) => (structure: FullStructure) => PromiseReturnType

type ConstructReviewPatch = (structure: FullStructure) => ReviewPatch

// Need to duplicate or create new review responses for all assigned questions
const useRestartReview: UseRestartReview = (reviewId) => {
  const [updateReview] = useUpdateReviewMutation()

  const constructReviewPatch: ConstructReviewPatch = (structure) => {
    const elements = Object.values(structure?.elementsById || {})
    const reviewableElements = elements.filter((element) => element?.isAssigned)

    // For re-assignment this would be slightly different, we need to consider latest review response of this level
    // not necessarily this thisReviewLatestResponse (would be just latestReviewResponse, from all reviews at this level)
    const reviewResponseCreate = reviewableElements.map(
      ({ thisReviewLatestResponse, response, assignmentId }) => {
        // create new if application response is not linked to latest review response
        const shouldCreateNew = thisReviewLatestResponse?.applicationResponse?.id !== response?.id
        return {
          decision: shouldCreateNew ? null : thisReviewLatestResponse?.decision,
          comment: shouldCreateNew ? null : thisReviewLatestResponse?.comment,
          applicationResponseId: response?.id,
          reviewQuestionAssignmentId: assignmentId,
        }
      }
    )

    return {
      trigger: Trigger.OnReviewCreate,
      reviewResponsesUsingId: {
        create: reviewResponseCreate,
      },
    }
  }

  const submitReview = async (structure: FullStructure) =>
    updateReview({
      variables: {
        reviewId: reviewId,
        reviewPatch: constructReviewPatch(structure),
      },
    })

  return submitReview
}

export default useRestartReview
