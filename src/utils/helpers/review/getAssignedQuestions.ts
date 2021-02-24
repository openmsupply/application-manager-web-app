import {
  ApplicationResponse,
  ReviewQuestionAssignment,
  TemplateElement,
} from '../../generated/graphql'
interface GetAssignedQuestionsProps {
  reviewQuestions: ReviewQuestionAssignment[]
}

/**
 * @function getAssignedQuestions
 * Returns array of type ReviewQuestion with assigned questions
 * to Reviewer from fetched in GraphQL type ReviewQuestionsAssigment
 * @param reviewQuestions GraphQL array of assigned questions
 */
const getAssignedQuestions = ({ reviewQuestions }: GetAssignedQuestionsProps) => {
  const assignedQuestions = reviewQuestions
    .filter((questionAssignment) => {
      // Remove review_response without a response link
      const { templateElement } = questionAssignment
      const { applicationResponses } = templateElement as TemplateElement
      return applicationResponses.nodes.length > 0
    })
    .map((questionAssignment) => {
      // Map each review_response to ReviewQuestion object
      const { templateElement } = questionAssignment
      const { code, section, applicationResponses } = templateElement as TemplateElement
      return {
        code,
        responseId: (applicationResponses.nodes[0] as ApplicationResponse).id,
        sectionIndex: section?.index as number,
      }
    })
  return assignedQuestions
}

export default getAssignedQuestions
