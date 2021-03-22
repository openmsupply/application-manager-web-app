import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplateAction($id: Int!, $data: TemplateActionPatch!) {
    updateTemplateAction(input: { patch: $data, id: $id }) {
      templateAction {
        id
        parameterQueries
        condition
        templateId
        actionCode
        trigger
        template {
          id
        }
      }
    }
  }
`
