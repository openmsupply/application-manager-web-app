import { gql } from '@apollo/client'

export default gql`
  query getFullTemplateInfo($id: Int!) {
    template(id: $id) {
      ...FullTemplate
    }
  }
`
