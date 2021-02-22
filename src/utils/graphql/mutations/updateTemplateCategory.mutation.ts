import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplateCategory($id: Int!, $icon: String, $title: String) {
    updateTemplateCategory(input: { patch: { icon: $icon, title: $title }, id: $id }) {
      templateCategory {
        id
        icon
        title
      }
    }
  }
`
