import { gql } from '@apollo/client'

export default gql`
  query getPermissionNames {
    permissionNames {
      nodes {
        name
        id
        templatePermissions {
          nodes {
            stageNumber
            level
            templateId
            restrictions
            id
          }
        }
        permissionPolicyId
        permissionPolicy {
          description
          id
          name
          rules
          type
          defaultRestrictions
        }
      }
    }
  }
`
