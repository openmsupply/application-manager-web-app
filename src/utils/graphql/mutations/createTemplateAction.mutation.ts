import { gql } from '@apollo/client'

export default gql`
  mutation createTemplateAction($data: TemplateActionInput!) {
    createTemplateAction(input: { templateAction: $data }) {
      templateAction {
        id
        condition
        parameterQueries
        actionCode
        trigger
        templateId
        template {
          id
          templateActions {
            nodes {
              id
            }
          }
        }
      }
    }
  }
`
