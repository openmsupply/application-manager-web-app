import { gql } from '@apollo/client'

export default gql`
  query getTemplate($code: String!, $status: TemplateStatus = AVAILABLE) {
    templates(condition: { code: $code, status: $status }) {
      nodes {
        ...Template
        templateSections {
          nodes {
            ...Section
            templateElementsBySectionId {
              nodes {
                ...elementFragment
              }
            }
          }
        }
        templateStages {
          nodes {
            id
            number
            title
            description
          }
        }
      }
    }
  }
`
