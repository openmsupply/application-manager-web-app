import { gql } from '@apollo/client'

export default gql`
  mutation setTemplateCategory($templateId: Int!, $categoryId: Int!) {
    updateTemplate(input: { patch: { templateCategoryId: $categoryId }, id: $templateId }) {
      template {
        templateCategory {
          id
        }
        templateCategoryId
        id
      }
    }
  }
`
