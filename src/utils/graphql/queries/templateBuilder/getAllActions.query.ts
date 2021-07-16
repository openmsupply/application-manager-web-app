import { gql } from '@apollo/client'

export default gql`
  query getAllActions {
    actionPlugins {
      nodes {
        id
        code
        description
        name
        optionalParameters
        outputProperties
        requiredParameters
      }
    }
  }
`
