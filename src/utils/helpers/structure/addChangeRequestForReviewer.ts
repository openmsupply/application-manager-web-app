import {
  ReviewResponse,
  ReviewResponseDecision,
  ReviewStatus,
  TemplateElementCategory,
} from '../../generated/graphql'
import { FullStructure } from '../../types'

const hasConsolidatorChangeRequest = (reviewerReviewResponse?: ReviewResponse) => {
  const consolidatorReviewResponses =
    reviewerReviewResponse?.reviewResponsesByReviewResponseLinkId?.nodes
  if (!consolidatorReviewResponses) return false
  const consolidatorReviewResponse = consolidatorReviewResponses[0] // Sorted in useGetReviewResponsesQuery
  return consolidatorReviewResponse?.decision === ReviewResponseDecision.Disagree
}

const addChangeRequestForReviewer = (structure: FullStructure): boolean => {
  const questionElements = Object.values(structure?.elementsById || {}).filter(
    ({ element }) => element?.category === TemplateElementCategory.Question
  )

  const hasConsolidatorChangeRequests = questionElements.some(
    ({ thisReviewLatestResponse, thisReviewPreviousResponse }) =>
      hasConsolidatorChangeRequest(thisReviewLatestResponse) ||
      hasConsolidatorChangeRequest(thisReviewPreviousResponse)
  )

  // No consolidation changes request, then don't set isChanged and isChangeRequested fields
  if (!hasConsolidatorChangeRequests) return false

  questionElements.forEach((element) => {
    const { thisReviewLatestResponse, thisReviewPreviousResponse } = element
    // For not draft review (in changes requested status), we check the consolidator linked reviewResponse on thisReviewLatestResponse
    if (structure?.thisReview?.status !== ReviewStatus.Draft) {
      const consolidatorLatestReviewResponse =
        thisReviewLatestResponse?.reviewResponsesByReviewResponseLinkId?.nodes[0] // Sorted in useGetReviewResponsesQuery
      element.isChangeRequest =
        consolidatorLatestReviewResponse?.decision === ReviewResponseDecision.Disagree
      element.isChanged = false
      return
    }

    // For draft review we check the consolidator linked reviewResponse on thisReviewPreviousResponse
    // and we should also set isChanged for all question elements
    const consolidatorLatestReviewResponse =
      thisReviewPreviousResponse?.reviewResponsesByReviewResponseLinkId.nodes[0] // Sorted in useGetReviewResponsesQuery
    element.isChangeRequest =
      consolidatorLatestReviewResponse?.decision === ReviewResponseDecision.Disagree
    element.isChanged =
      thisReviewLatestResponse?.comment !== thisReviewPreviousResponse?.comment ||
      thisReviewLatestResponse?.decision !== thisReviewPreviousResponse?.decision
  })

  return true
}

export default addChangeRequestForReviewer
