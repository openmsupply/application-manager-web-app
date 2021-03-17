import { ReviewResponse } from '../../generated/graphql'
import { FullStructure } from '../../types'
import getGroupedReviewResponses from './getGroupedReviewResponses'

const addThisReviewResponses = ({
  structure,
  sortedReviewResponses,
}: {
  structure: FullStructure
  sortedReviewResponses: ReviewResponse[]
}) => {
  const { elementsById } = structure

  if (!elementsById) return structure

  const groupedReviewResponses = getGroupedReviewResponses(sortedReviewResponses)

  Object.entries(groupedReviewResponses).forEach(([templateElementId, responseGroup]) => {
    const element = elementsById[templateElementId]
    if (!element) return

    element.thisReviewLatestResponse = responseGroup[0]

    // this would be true before re-reviews is started, where new application responses are not linked to isThiReviewLatestResponse
    element.isThisReviewLatestReponseOutdated =
      element.response?.id != element.thisReviewLatestResponse?.applicationResponse?.id

    if (responseGroup.length === 1) return
  })

  return structure
}

export default addThisReviewResponses
