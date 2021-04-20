import { gql } from '@apollo/client'

export default gql`
  mutation updateReviewAssignment($assignmentId: Int!, $assignmentPatch: ReviewAssignmentPatch!) {
    updateReviewAssignment(input: { id: $assignmentId, patch: $assignmentPatch }) {
      reviewAssignment {
        id
        status
        timeUpdated
        reviewQuestionAssignments {
          nodes {
            id
            templateElement {
              id
              section {
                id
                code
              }
            }
          }
        }
      }
    }
  }
`
