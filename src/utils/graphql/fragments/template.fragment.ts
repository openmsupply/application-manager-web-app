import { gql } from '@apollo/client'

export default gql`
  fragment Template on Template {
    code
    id
    name
    namePlural
    isLinear
    startMessage
    submissionMessage
    templateCategory {
      title
      icon
    }
    templateFilterJoins {
      nodes {
        filter {
          id
          query
          title
          userRole
        }
      }
    }
    applications {
      totalCount
    }
  }
`
