import { gql } from '@apollo/client'

export default gql`
  mutation deleteTemplatePermission($id: Int!) {
    deleteTemplatePermission(input: { id: $id }) {
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
`
