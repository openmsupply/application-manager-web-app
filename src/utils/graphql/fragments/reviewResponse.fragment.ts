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
    originalReviewResponse {
      decision
    }
    applicationResponse {
      id
      templateElementId
    }
    review {
      id
      status
      stageNumber
      levelNumber
      reviewer {
        ...User
      }
    }
  }
`
