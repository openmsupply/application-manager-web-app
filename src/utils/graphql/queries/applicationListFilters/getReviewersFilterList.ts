import { gql } from '@apollo/client'

export default gql`
  query getReviewersFilterList($searchValue: String!, $templateCode: String!) {
    applicationListFilterReviewer(reviewer: $searchValue, templateCode: $templateCode) {
      nodes
      totalCount
    }
  }
`
