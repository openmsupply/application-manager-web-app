import { gql } from '@apollo/client'

export default gql`
  mutation createTemplateCategory($icon: String, $title: String) {
    createTemplateCategory(input: { templateCategory: { icon: $icon, title: $title } }) {
      clientMutationId
    }
  }
`
