import { gql } from '@apollo/client'

export default gql`
  query getAllFilters {
    filters {
      nodes {
        code
        icon
        iconColor
        id
        query
        title
        userRole
      }
    }
  }
`
