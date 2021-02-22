import { gql } from '@apollo/client'

export default gql`
  mutation createTemplateFilter($userRole: String) {
    __typename
    createFilter(
      input: { filter: { code: "New Filter", title: "New Filter", userRole: $userRole, query: {} } }
    ) {
      filter {
        id
      }
    }
  }
`
