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
    templatePermissions {
      nodes {
        id
        permissionName {
          name
          id
          permissionPolicy {
            name
            id
            rules
            type
          }
          permissionPolicyId
        }
        restrictions
        stageNumber
        templateId
        level
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
          color
          title
          userRole
        }
      }
    }
  }
`
