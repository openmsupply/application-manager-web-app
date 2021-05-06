import {
  useUpdateReviewMutation,
  ReviewPatch,
  Trigger,
  Decision,
  ReviewResponseStatus,
} from '../generated/graphql'
import { AssignmentDetails, FullStructure, PageElement } from '../types'
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
    // Check for draft review response in case consolidation is ongoing and new review response is added
    const isDraftReviewResponse = (element: PageElement) =>
      element.thisReviewLatestResponse &&
      element.thisReviewLatestResponse.status === ReviewResponseStatus.Draft
    // Exclude not assigned, not visible and missing responses
    const reviewableElements = elements.filter(
      (element) => element.isPendingReview && !isDraftReviewResponse(element)
    )

    // For re-assignment this would be slightly different, we need to consider latest review response of this level
    // not necessarily this thisReviewLatestResponse (would be just latestReviewResponse, from all reviews at this level)
    const reviewResponseCreate = reviewableElements.map(
      ({
        isPendingReview,
        thisReviewLatestResponse,
        response,
        reviewQuestionAssignmentId,
        lowerLevelReviewPreviousResponse,
      }) => {
        const applicationResponseId = assignment.level > 1 ? undefined : response?.id
        const reviewResponseLinkId =
          assignment.level === 1 ? undefined : lowerLevelReviewPreviousResponse?.id
        // create new if element is awaiting review
        const shouldCreateNew = isPendingReview
        return {
          decision: shouldCreateNew ? null : thisReviewLatestResponse?.decision,
          comment: shouldCreateNew ? null : thisReviewLatestResponse?.comment,
          applicationResponseId,
          reviewResponseLinkId,
          reviewQuestionAssignmentId,
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
