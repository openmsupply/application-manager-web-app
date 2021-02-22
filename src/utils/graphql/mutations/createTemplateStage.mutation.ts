import { gql } from '@apollo/client'

export default gql`
  mutation createTemplateStage($data: TemplateStageInput!) {
    createTemplateStage(input: { templateStage: $data }) {
      templateStage {
        id
        number
        title
        description
        template {
          id
          templateStages {
            nodes {
              id
            }
          }
        }
      }
    }
  }
`
