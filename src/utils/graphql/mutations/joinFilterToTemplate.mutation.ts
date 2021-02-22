import { gql } from '@apollo/client'

export default gql`
  mutation joinFilterToTemplate($templateId: Int!, $filterId: Int!) {
    createTemplateFilterJoin(
      input: { templateFilterJoin: { templateFilterId: $filterId, templateId: $templateId } }
    ) {
      templateFilterJoin {
        id
        templateId
        templateFilterId
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
      }
    }
  }
`
