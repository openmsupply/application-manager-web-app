import { ReviewResponse } from '../../generated/graphql'
import { FullStructure, PageElement } from '../../types'
import getGroupedReviewResponses from './getGroupedReviewResponses'

type SetReviewResponseOnElement = (element: PageElement, response: ReviewResponse) => void

const addReviewResponses = (
  structure: FullStructure,
  sortedReviewResponses: ReviewResponse[],
  setLatestResponseOnElement: SetReviewResponseOnElement,
  setPreviousResponseOnElement: SetReviewResponseOnElement
) => {
  const { elementsById } = structure

  if (!elementsById) return structure

  const groupedReviewResponses = getGroupedReviewResponses(sortedReviewResponses)

  Object.entries(groupedReviewResponses).forEach(([templateElementId, responseGroup]) => {
    const element = elementsById[templateElementId]
    if (!element) return

    // This method is used for thisReviewResponse, previousReviewResponse and originalReviewResponse, thus method is passed to set the required field
    setLatestResponseOnElement(element, responseGroup[0])

    if (responseGroup.length === 1) return
    setPreviousResponseOnElement(element, responseGroup[1])
  })

  return structure
}

export default addReviewResponses
