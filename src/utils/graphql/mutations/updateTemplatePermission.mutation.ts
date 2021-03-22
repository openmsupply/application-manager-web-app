import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplatePermission($id: Int!, $data: TemplatePermissionPatch!) {
    updateTemplatePermission(input: { patch: $data, id: $id }) {
      templatePermission {
        id
        restrictions
        template {
          id
        }
      }
    }
  }
`
