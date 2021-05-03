import { gql } from '@apollo/client'

export default gql`
  fragment Template on Template {
    code
    id
    name
    isLinear
    startMessage
    submissionMessage
    templateCategory {
      title
      icon
    }
    templateFilterJoins {
      nodes {
        templateFilter {
          iconColor
          icon
          query
          title
          userRole
        }
      }
    }
  }
`
