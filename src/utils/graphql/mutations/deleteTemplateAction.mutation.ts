import { gql } from '@apollo/client'

export default gql`
  mutation deleteTemplateAction($id: Int!) {
    deleteTemplateAction(input: { id: $id }) {
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
`
