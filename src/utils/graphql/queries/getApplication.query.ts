import { gql } from '@apollo/client'

export default gql`
  query getApplication($serial: String!) {
    applicationBySerial(serial: $serial) {
      ...Application
      template {
        ...Template
        templateSections(orderBy: INDEX_ASC) {
          nodes {
            ...Section
            templateElementsBySectionId(orderBy: INDEX_ASC) {
              nodes {
                ...elementFragment
              }
            }
          }
        }
        templateStages {
          nodes {
            ...TemplateStage
          }
        }
      }
      user {
        ...User
      }
      org {
        ...Organisation
      }
    }
    applicationStageStatusLatests(condition: { serial: $serial }) {
      nodes {
        ...Stage
      }
    }
  }
`
