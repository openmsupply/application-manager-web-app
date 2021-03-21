import { gql } from '@apollo/client'

export default gql`
  mutation assignSectionToUser($assignmentId: Int!, $assignmentPatch: ReviewAssignmentPatch!) {
    updateReviewAssignment(input: { id: $assignmentId, patch: $assignmentPatch }) {
      reviewAssignment {
        id
        status
        timeCreated
        reviewQuestionAssignments {
          nodes {
            id
            templateElementId
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
