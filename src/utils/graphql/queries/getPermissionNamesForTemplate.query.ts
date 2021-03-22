import { gql } from '@apollo/client'

export default gql`
  query getPermissionNamesForTemplate($templateId: Int!) {
    permissionNames(
      filter: { templatePermissions: { every: { templateId: { equalTo: $templateId } } } }
    ) {
      nodes {
        name
        templatePermissions {
          nodes {
            stageNumber
            level
            templateId
            restrictions
            id
          }
        }
        permissionPolicy {
          type
          rules
          name
          description
          defaultRestrictions
          id
        }
        id
      }
    }
  }
`
