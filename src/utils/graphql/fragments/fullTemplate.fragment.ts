import { gql } from '@apollo/client'

export default gql`
  fragment FullTemplate on Template {
    status
    code
    id
    isLinear
    name
    submissionMessage
    startMessage
    templateCategory {
      code
      icon
      id
      title
    }
    applications {
      totalCount
    }
    version
    versionTimestamp
    templateFilterJoins {
      nodes {
        id
        filter {
          id
          icon
          code
          iconColor
          nodeId
          query
          title
          userRole
        }
      }
    }
  }
`
