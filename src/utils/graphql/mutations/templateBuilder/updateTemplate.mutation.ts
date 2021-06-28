import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplate($id: Int!, $templatePatch: TemplatePatch!) {
    updateTemplate(input: { id: $id, patch: $templatePatch }) {
      template {
        ...FullTemplate
      }
    }
  }
`
