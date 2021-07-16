import { gql } from '@apollo/client'

export default gql`
  query geTemplateActionByCode($pluginCode: String!) {
    templateActions(filter: { actionCode: { equalTo: $pluginCode } }) {
      nodes {
        id
        description
        condition
        parameterQueries
        trigger
        description
        template {
          name
          code
        }
      }
    }
  }
`
