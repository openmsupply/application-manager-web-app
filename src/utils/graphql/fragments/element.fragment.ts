import { gql } from '@apollo/client'

export default gql`
  fragment elementFragment on TemplateElement {
    id
    code
    index
    title
    elementTypePluginCode
    category
    visibilityCondition
    isRequired
    isEditable
    validation
    validationMessage
    helpText
    defaultValue
    parameters
  }
`
