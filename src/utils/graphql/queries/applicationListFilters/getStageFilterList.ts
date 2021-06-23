import { gql } from '@apollo/client'

export default gql`
  query getStageFilterList($templateCode: String!) {
    applicationListFilterStage(templateCode: $templateCode) {
      nodes
      totalCount
    }
  }
`
