import { gql } from '@apollo/client'

export default gql`
  fragment reviewResponseFragment on ReviewResponse {
    applicationResponseId
    decision
    comment
    id
    status
    timeUpdated
    originalReviewResponseId
    reviewResponseLinkId
    templateElementId
    applicationResponse {
      id
      templateElementId
    }
    review {
      id
      status
      reviewer {
        ...User
      }
    }
  }
`
