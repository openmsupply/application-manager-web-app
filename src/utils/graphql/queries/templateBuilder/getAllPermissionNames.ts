import { gql } from '@apollo/client'

export default gql`
  query getAllPermissionNames {
    permissionNames {
      nodes {
        id
        name
        permissionPolicyId
        permissionPolicy {
          id
          name
          rules
          type
          description
          defaultRestrictions
        }
      }
    }
  }
`
