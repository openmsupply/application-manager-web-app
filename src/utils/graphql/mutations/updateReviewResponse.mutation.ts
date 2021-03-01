import { gql } from '@apollo/client'

export default gql`
  mutation updateReviewResponse($id: Int!, $decision: ReviewResponseDecision, $comment: String) {
    updateReviewResponse(input: { id: $id, patch: { decision: $decision, comment: $comment } }) {
      reviewResponse {
        id
        decision
        comment
        applicationResponse {
          id
        }
        review {
          id
          reviewResponses {
            nodes {
              id
              decision
              comment
              applicationResponse {
                id
              }
            }
          }
        }
      }
    }
  }
`
