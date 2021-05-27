import { gql } from '@apollo/client'

export default gql`
  fragment Element on TemplateElement {
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
    parameters
  }
`
