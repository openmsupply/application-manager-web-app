import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplateFilter($id: Int!, $data: FilterPatch!) {
    updateFilter(input: { patch: $data, id: $id }) {
      filter {
        id
        code
        icon
        query
        title
        userRole
      }
    }
  }
`
