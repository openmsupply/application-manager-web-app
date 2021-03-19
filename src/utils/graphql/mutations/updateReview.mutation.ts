import { gql } from '@apollo/client'

export default gql`
  mutation updateReview($reviewId: Int!, $reviewPatch: ReviewPatch!) {
    updateReview(input: { id: $reviewId, patch: $reviewPatch }) {
      review {
        id
        trigger
        reviewResponses {
          nodes {
            id
            decision
            comment
          }
        }
        reviewDecisions {
          nodes {
            id
            decision
            timeUpdated
          }
        }
      }
    }
  }
`
