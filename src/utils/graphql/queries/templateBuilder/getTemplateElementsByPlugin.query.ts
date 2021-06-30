import { gql } from '@apollo/client'

export default gql`
  query getTemplateElementsByPlugin($pluginCode: String!) {
    templateElements(filter: { elementTypePluginCode: { equalTo: $pluginCode } }) {
      nodes {
        category
        helpText
        isEditable
        isRequired
        parameters
        validation
        code
        title
        id
        defaultValue
        validationMessage
        visibilityCondition
        templateCode
      }
    }
  }
`
