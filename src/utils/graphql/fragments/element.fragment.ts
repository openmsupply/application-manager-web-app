import { gql } from '@apollo/client'

export default gql`
  fragment Element on TemplateElement {
    id
    code
    index
    title
    sectionId
    elementTypePluginCode
    category
    visibilityCondition
    isRequired
    isEditable
    validation
    validationMessage
    parameters
  }
`
