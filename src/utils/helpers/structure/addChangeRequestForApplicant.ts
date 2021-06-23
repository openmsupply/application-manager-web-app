import deepEqual from 'deep-equal'
import {
  ApplicationResponse,
  ApplicationStatus,
  ReviewResponseDecision,
  TemplateElementCategory,
} from '../../generated/graphql'
import { FullStructure } from '../../types'

const hasReviewResponse = (applicationResponse: ApplicationResponse) =>
  applicationResponse?.reviewResponses.nodes?.length > 0

const addApplicantChangeRequestStatusToElement = (structure: FullStructure) => {
  const questionElements = Object.values(structure?.elementsById || {}).filter(
    ({ element }) => element?.category === TemplateElementCategory.Question
  )

  const hasReviewResponses = questionElements.some(
    ({ latestApplicationResponse, previousApplicationResponse }) =>
      hasReviewResponse(latestApplicationResponse) || hasReviewResponse(previousApplicationResponse)
  )

  // No reviews, then don't set isChanged and isChangeRequested fields
  if (!hasReviewResponses) return

  questionElements.forEach((element) => {
    const { latestApplicationResponse, previousApplicationResponse } = element
    const latestReviewResponse = latestApplicationResponse?.reviewResponses?.nodes[0]
    const previousReviewResponse = previousApplicationResponse?.reviewResponses?.nodes[0]
    // For not draft application (in changes requested), we just check the latestApplicationResponse
    if (structure?.info?.currentStage.status !== ApplicationStatus.Draft) {
      element.isChangeRequest = latestReviewResponse?.decision === ReviewResponseDecision.Decline
      element.isChanged = false
      return
    }

    // For draft application we check previousApplicationResponse
    // and we should also set isChanged for all question elements
    element.isChangeRequest = previousReviewResponse?.decision === ReviewResponseDecision.Decline
    element.isChanged = !deepEqual(
      latestApplicationResponse?.value,
      previousApplicationResponse?.value
    )
  })
}

export default addApplicantChangeRequestStatusToElement
