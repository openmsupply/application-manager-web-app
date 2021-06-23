import { gql } from '@apollo/client'

export default gql`
  query getAssignerFilterList($searchValue: String!, $templateCode: String!) {
    applicationListFilterAssigner(assigner: $searchValue, templateCode: $templateCode) {
      nodes
      totalCount
    }
  }
`
