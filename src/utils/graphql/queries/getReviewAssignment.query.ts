import { gql } from '@apollo/client'

export default gql`
  query getReviewAssignment($reviewerId: Int!, $applicationId: Int, $stageId: Int) {
    reviewAssignments(
      condition: { reviewerId: $reviewerId, applicationId: $applicationId, stageId: $stageId }
    ) {
      nodes {
        id
        applicationId
        reviewer {
          id
          username
          firstName
          lastName
        }
        stageId
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
              applicationResponses(condition: { applicationId: $applicationId }) {
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
