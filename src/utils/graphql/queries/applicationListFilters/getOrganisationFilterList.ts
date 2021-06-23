import { gql } from '@apollo/client'

export default gql`
  query getOrganisationFilterList($searchValue: String!, $templateCode: String!) {
    applicationListFilterOrganisation(organisation: $searchValue, templateCode: $templateCode) {
      nodes
      totalCount
    }
  }
`
