import { gql } from '@apollo/client'

export default gql`
  mutation createTemplateElement($data: TemplateElementInput!) {
    createTemplateElement(input: { templateElement: $data }) {
      templateElement {
        ...Element
      }
    }
  }
`
