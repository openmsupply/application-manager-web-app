import { gql } from '@apollo/client'

export default gql`
  mutation deleteTemplateFilterJion($id: Int!) {
    deleteTemplateFilterJoin(input: { id: $id }) {
      template {
        id
        templateFilterJoins {
          nodes {
            id
          }
        }
      }
      templateFilter {
        id
        templateFilterJoinsByTemplateFilterId {
          nodes {
            id
          }
        }
      }
      templateFilterJoin {
        id
      }
    }
  }
`
