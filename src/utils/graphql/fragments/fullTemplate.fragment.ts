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
    configApplications: applications(filter: { isConfig: { equalTo: true } }) {
      nodes {
        serial
        id
      }
    }
    applications(filter: { isConfig: { equalTo: false } }) {
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
