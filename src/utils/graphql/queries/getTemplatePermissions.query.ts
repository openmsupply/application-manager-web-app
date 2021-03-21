import { gql } from '@apollo/client'

export default gql`
  query getTemplatePermissions($templateId: Int!) {
    templatePermissions(condition: { templateId: $templateId }) {
      nodes {
        level
        id
        nodeId
        restrictions
        permissionName {
          name
          permissionPolicy {
            description
            name
            rules
            type
          }
        }
      }
    }
  }
`
