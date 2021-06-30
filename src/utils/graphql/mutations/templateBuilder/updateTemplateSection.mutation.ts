import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplateSection($id: Int!, $sectionPatch: TemplateSectionPatch!) {
    updateTemplateSection(input: { id: $id, patch: $sectionPatch }) {
      templateSection {
        id
        index
        code
        templateId
        title
        templateElementsBySectionId {
          nodes {
            ...elementFragment
            applicationResponses {
              nodes {
                id
                application {
                  id
                  serial
                  applicationResponses {
                    nodes {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
