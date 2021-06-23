import { gql } from '@apollo/client'

export default gql`
  query getApplication($serial: String!) {
    applicationBySerial(serial: $serial) {
      ...Application
      template {
        ...Template
        templateStages {
          nodes {
            ...TemplateStage
          }
        }
      }
      applicationSections {
        nodes {
          id
          templateSection {
            ...Section
            templateElementsBySectionId(orderBy: INDEX_ASC) {
              nodes {
                ...elementFragment
              }
            }
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
