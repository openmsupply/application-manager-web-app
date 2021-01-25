import { gql } from '@apollo/client'

export default gql`
  query getReviewStatus($reviewId: Int!) {
    reviewStatusHistories(condition: { isCurrent: true, reviewId: $reviewId }) {
      nodes {
        status
      }
    }
  }
`
