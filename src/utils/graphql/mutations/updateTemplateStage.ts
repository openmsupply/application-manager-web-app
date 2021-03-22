import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplateStage($id: Int!, $data: TemplateStagePatch!) {
    updateTemplateStage(input: { patch: $data, id: $id }) {
      templateStage {
        id
        title
        description
        templateId
        template {
          id
        }
      }
    }
  }
`
