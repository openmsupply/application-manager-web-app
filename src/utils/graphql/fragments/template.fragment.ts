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
    templateStages {
      nodes {
        number
        description
        title
      }
    }
    templateFilterJoins {
      nodes {
        id
        templateId
        templateFilterId
        template {
          id
        }
        templateFilter {
          id
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
