import { ReviewResponse } from '../../generated/graphql'
import { FullStructure } from '../../types'
import addElementsById from './addElementsById'
import getGroupedReviewResponses from './getGroupedReviewResponses'

const addOwnedReviewResponse = ({
  structure,
  sortedReviewResponses,
}: {
  structure: FullStructure
  sortedReviewResponses: ReviewResponse[]
}) => {
  const newStructure = addElementsById(structure)
  const { elementsById } = newStructure

  const groupedReviewResponses = getGroupedReviewResponses(sortedReviewResponses)

  Object.entries(groupedReviewResponses).forEach(([templateElementId, responseGroup]) => {
    const element = elementsById[templateElementId]
    if (!element) return

    element.latestOwnedReviewResponse = responseGroup[0]
    if (responseGroup.length === 1) return
  })

  return newStructure
}

export default addOwnedReviewResponse
