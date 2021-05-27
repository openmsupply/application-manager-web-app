import { gql } from '@apollo/client'

export default gql`
  fragment consolidatorResponseFragment on ReviewResponse {
    reviewResponsesByReviewResponseLinkId(
      orderBy: TIME_UPDATED_DESC
      filter: { status: { notEqualTo: DRAFT } }
    ) {
      nodes {
        ...reviewResponseFragment
      }
    }
  }
`
