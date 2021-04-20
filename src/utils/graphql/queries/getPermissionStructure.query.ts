import { gql } from '@apollo/client'

export default gql`
  query getPermissionStructure {
    templates {
      nodes {
        id
        templatePermissions {
          nodes {
            id
            restrictions
            stageNumber
            levelNumber
            templateId
            permissionName {
              id
              name
              permissionPolicy {
                id
                name
                type
              }
              permissionJoins {
                nodes {
                  user {
                    username
                  }
                }
              }
            }
          }
        }
        code
      }
    }
  }
`
