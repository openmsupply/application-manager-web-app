import { gql } from '@apollo/client'

export default gql`
  query getPermissionStatistics($id: Int!, $name: String!, $rowLeveSearch: String!) {
    permissionName(id: $id) {
      name
      permissionJoins {
        nodes {
          organisation {
            name
          }
          user {
            firstName
            lastName
            email
            username
          }
        }
      }
      permissionPolicy {
        description
        rules
        type
        name
      }
      templatePermissions {
        nodes {
          template {
            id
            name
            code
            version
          }
        }
      }
    }
    templateActions(filter: { parametersQueriesString: { includes: $name } }) {
      nodes {
        actionCode
        condition
        parameterQueries
        trigger
        template {
          code
          name
        }
      }
    }
    templateElements(filter: { parametersString: { includes: $name } }) {
      nodes {
        code
        parameters
        title
        section {
          template {
            code
            name
          }
        }
      }
    }
    postgresRowLevels(filter: { policyname: { endsWith: $rowLeveSearch } }) {
      nodes {
        policyname
        tablename
        withCheck
        qual
        roles
        schemaname
        permissive
        cmd
      }
    }
  }
`
