import { gql } from '@apollo/client'

export default gql`
  mutation createTemplatePermission($data: TemplatePermissionInput!) {
    createTemplatePermission(input: { templatePermission: $data }) {
      templatePermission {
        id
        level
        stageNumber
        restrictions
        templateId
        permissionNameId
        permissionName {
          id
          templatePermissions {
            nodes {
              id
            }
          }
        }
        template {
          id
          templatePermissions {
            nodes {
              id
            }
          }
        }
      }
    }
  }
`
