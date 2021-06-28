import { gql } from '@apollo/client'

export default gql`
  query getAllTemplates {
    templates {
      nodes {
        code
        status
        id
        version
        versionTimestamp
        name
        status
        templateCategory {
          title
        }
        applications {
          totalCount
        }
      }
    }
  }
`
