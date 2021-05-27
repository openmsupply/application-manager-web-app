import { ReviewResponse } from '../../generated/graphql'

type GroupedReviewResponses = {
  [templateElementId: string]: ReviewResponse[]
}

const getGroupedReviewResponses = (reviewResponses: ReviewResponse[]): GroupedReviewResponses => {
  const result: GroupedReviewResponses = {}

  reviewResponses.forEach((reviewResponse) => {
    const responseTemplateElementId = reviewResponse.templateElementId
    if (!responseTemplateElementId) return

    if (!result[responseTemplateElementId]) result[responseTemplateElementId] = []

    result[responseTemplateElementId].push(reviewResponse)
  })

  return result
}

export default getGroupedReviewResponses
