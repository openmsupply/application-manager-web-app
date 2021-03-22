import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplateSection($id: Int!, $data: TemplateSectionPatch!) {
    updateTemplateSection(input: { patch: $data, id: $id }) {
      templateSection {
        id
        title
        templateId
        code
        index
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
