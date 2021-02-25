import { gql } from '@apollo/client'

export default gql`
  mutation createTemplateSection($data: TemplateSectionInput!) {
    createTemplateSection(input: { templateSection: $data }) {
      templateSection {
        id
        title
        templateId
        code
        template {
          id
          templateSections {
            nodes {
              id
            }
          }
        }
      }
    }
  }
`
