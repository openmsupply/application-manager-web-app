import deepEqual from 'deep-equal'
import {
  ApplicationStatus,
  ReviewResponseDecision,
  TemplateElementCategory,
} from '../../generated/graphql'
import { FullStructure } from '../../types'

const addApplicantChangeRequestStatusToElement = (structure: FullStructure) => {
  const questionElements = Object.values(structure?.elementsById || {}).filter(
    ({ element }) => element?.category === TemplateElementCategory.Question
  )

  questionElements.forEach((element) => {
    const { latestApplicationResponse, previousApplicationResponse } = element
    const latestReviewResponse = latestApplicationResponse?.reviewResponses?.nodes[0]
    const previousReviewResponse = previousApplicationResponse?.reviewResponses?.nodes[0]
    // For not draft application (in changes requested), we just check the latestApplicationResponse
    if (structure?.info?.current?.status !== ApplicationStatus.Draft) {
      element.isChangeRequest = latestReviewResponse?.decision === ReviewResponseDecision.Decline
      element.isChanged = false
      return
    }

    // For draft applicaiton we check previousApplicationResponse
    // and we should aslo set isChanged for all question elements
    element.isChangeRequest = previousReviewResponse?.decision === ReviewResponseDecision.Decline
    element.isChanged = !deepEqual(
      latestApplicationResponse?.value,
      previousApplicationResponse?.value
    )
  })
}

export default addApplicantChangeRequestStatusToElement