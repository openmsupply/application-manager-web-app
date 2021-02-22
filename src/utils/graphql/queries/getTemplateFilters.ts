import { gql } from '@apollo/client'

export default gql`
  query getTemplateFilters {
    filters {
      nodes {
        code
        icon
        id
        query
        title
        userRole
      }
    }
  }
`
