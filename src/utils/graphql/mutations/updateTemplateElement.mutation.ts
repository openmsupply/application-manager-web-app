import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplateElement($id: Int!, $data: TemplateElementPatch!) {
    updateTemplateElement(input: { patch: $data, id: $id }) {
      templateElement {
        ...Element
        section {
          id
          template {
            id
            applications {
              nodes {
                serial
                id
              }
            }
          }
          id
        }
      }
    }
  }
`
