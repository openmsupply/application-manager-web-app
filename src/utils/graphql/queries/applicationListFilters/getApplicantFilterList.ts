import { gql } from '@apollo/client'

export default gql`
  query getAppplicantFilterList($searchValue: String!, $templateCode: String!) {
    applicationListFilterApplicant(applicant: $searchValue, templateCode: $templateCode) {
      nodes
      totalCount
    }
  }
`
