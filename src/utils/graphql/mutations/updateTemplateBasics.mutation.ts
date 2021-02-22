import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplateBasics($id: Int!, $data: TemplatePatch!) {
    updateTemplate(input: { patch: $data, id: $id }) {
      template {
        id
        name
        code
        startMessage
      }
    }
  }
`
