import { useUpdateReviewMutation, ReviewPatch, Trigger, Decision } from '../generated/graphql'
import { AssignmentDetails, FullStructure } from '../types'
import { useGetFullReviewStructureAsync } from './useGetReviewStructureForSection'

// below lines are used to get return type of the function that is returned by useRestartReviewMutation
type UseUpdateReviewMutationReturnType = ReturnType<typeof useUpdateReviewMutation>
type PromiseReturnType = ReturnType<UseUpdateReviewMutationReturnType[0]>
// hook used to restart a review, , as per type definition below (returns promise that resolve with mutation result data)
type UseRestartReview = (props: {
  reviewId: number
  structure: FullStructure
  assignment: AssignmentDetails
}) => () => PromiseReturnType

type ConstructReviewPatch = (structure: FullStructure) => ReviewPatch

// Need to duplicate or create new review responses for all assigned questions
const useRestartReview: UseRestartReview = ({ reviewId, structure, assignment }) => {
  const [updateReview] = useUpdateReviewMutation()

  const getFullReviewStructureAsync = useGetFullReviewStructureAsync({
    fullApplicationStructure: structure,
    reviewAssignment: assignment,
  })

  const constructReviewPatch: ConstructReviewPatch = (structure) => {
    const elements = Object.values(structure?.elementsById || {})

    // Exclude not assigned, not visible and missing responses
    const reviewableElements = elements.filter(
      (element) => element?.isAssigned && element?.element.isVisible && element.response?.id
    )

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
      trigger: Trigger.OnReviewRestart,
      reviewResponsesUsingId: {
        create: reviewResponseCreate,
      },
      // create new empty decision (do we need to duplicate comment from latest decision ?)
      reviewDecisionsUsingId: {
        create: [{ decision: Decision.NoDecision }],
      },
    }
  }

  return async () => {
    const result = await updateReview({
      variables: {
        reviewId: reviewId,
        reviewPatch: constructReviewPatch(await getFullReviewStructureAsync()),
      },
    })
    if (result.errors) throw new Error(result.errors.toString())
    return result
  }
}

export default useRestartReview
