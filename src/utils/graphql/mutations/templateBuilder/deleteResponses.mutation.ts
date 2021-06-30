import { gql } from '@apollo/client'

export default gql`
  mutation createSection(
    $templateId: Int!
    $index: Int!
    $code: String = "newSection"
    $title: String = "New Section"
  ) {
    createTemplateSection(
      input: {
        templateSection: { code: $code, index: $index, templateId: $templateId, title: $title }
      }
    ) {
      templateSection {
        id
        template {
          id
          templateSections {
            nodes {
              id
            }
          }
        }
        code
        index
        title
        templateId
      }
    }
  }
`
