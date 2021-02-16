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
      icon
      id
      title
    }
    templateActions {
      nodes {
        actionCode
        condition
        id
        nodeId
        parameterQueries
        sequence
        trigger
      }
    }
    templateFilterJoins {
      nodes {
        templateFilter {
          code
          icon
          query
          title
          userRole
        }
      }
    }
  }
`
