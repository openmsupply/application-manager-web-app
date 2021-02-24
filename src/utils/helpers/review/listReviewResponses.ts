import { TemplateElementCategory } from '../../generated/graphql'
import { ReviewerResponsesPayload, ReviewQuestionDecision } from '../../types'

/**
 * @function listReviewResponses
 * Returns a list with all review responses given by current reviewer
 * for one review, regardeless of the Review status.
 * @param userId Current reviewer userId
 * @param reviewSections All reviews responses and elements of application
 */
const listReviewResponses = ({ userId, reviewSections }: ReviewerResponsesPayload) => {
  const assignedSections = Object.values(reviewSections).filter(
    ({ assigned }) => assigned?.id === userId
  )
  const listReviewResponses: ReviewQuestionDecision[] = []
  assignedSections.forEach(({ pages }) => {
    const sectionReviewResponses: ReviewQuestionDecision[] = []
    Object.values(pages).forEach(({ state }) => {
      // TODO: Create utility function to filter out all INFORMATION elements when checking for status
      const pageReviewResponses = state
        .filter(({ element }) => element.category === TemplateElementCategory.Question)
        .filter(({ review }) => review?.decision !== undefined)
        .map(({ review }) => review as ReviewQuestionDecision)
      sectionReviewResponses.push(...pageReviewResponses)
    })
    listReviewResponses.push(...sectionReviewResponses)
  })
  return listReviewResponses
}

export default listReviewResponses
