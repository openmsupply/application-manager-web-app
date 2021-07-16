import { gql } from '@apollo/client'

export default gql`
  fragment reviewResponseFragment on ReviewResponse {
    id
    applicationResponseId
    decision
    comment
    stageNumber
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
      stageNumber
      levelNumber
      reviewer {
        ...User
      }
    }
  }
`
