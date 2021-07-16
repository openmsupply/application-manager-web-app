import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplateStage($id: Int!, $templateStagePatch: TemplateStagePatch!) {
    updateTemplateStage(input: { id: $id, patch: $templateStagePatch }) {
      templateStage {
        id
        number
        colour
        title
        description
        templateStageReviewLevelsByStageId {
          nodes {
            description
            id
            name
            number
          }
        }
      }
    }
  }
`
