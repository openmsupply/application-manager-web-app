import { gql } from '@apollo/client'

export default gql`
  mutation updateReviewAssignment($id: Int!, $data: ReviewAssignmentPatch!) {
    updateReviewAssignment(input: { id: $id, patch: $data }) {
      reviewAssignment {
        id
        applicationId
        reviewer {
          id
          username
          firstName
          lastName
        }
        stageId
        level
        status
        stage {
          title
        }
        reviews {
          nodes {
            id
            status
            reviewResponses {
              nodes {
                id
                comment
                decision
                applicationResponse {
                  id
                }
              }
            }
          }
        }
        reviewQuestionAssignments {
          nodes {
            templateElement {
              code
              section {
                id
                index
              }
              applicationResponses {
                nodes {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`
