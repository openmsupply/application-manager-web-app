import { gql } from '@apollo/client'

export default gql`
  mutation updateTemplateElement($id: Int!, $templateElementPatch: TemplateElementPatch!) {
    __typename
    updateTemplateElement(input: { patch: $templateElementPatch, id: $id }) {
      templateElement {
        id
        category
        code
        defaultValue
        elementTypePluginCode
        helpText
        index
        isEditable
        isRequired
        parameters
        sectionId
        templateCode
        templateVersion
        title
        validation
        validationMessage
        visibilityCondition
        section {
          id
          template {
            id
          }
        }
      }
    }
  }
`
