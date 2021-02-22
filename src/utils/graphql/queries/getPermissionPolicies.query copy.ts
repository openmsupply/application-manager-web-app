import { gql } from '@apollo/client'

export default gql`
  query getPermissionPolicies {
    permissionPolicies {
      nodes {
        defaultRestrictions
        description
        id
        name
        permissionNames {
          nodes {
            name
            nodeId
            permissionPolicyId
          }
        }
        rules
        type
      }
    }
  }
`
