import { gql } from '@apollo/client'

export default gql`
  query getPermissionStatistics($id: Int!, $name: String!, $rowLeveSearch: String!) {
    permissionName(id: $id) {
      name
      permissionJoins {
        nodes {
          id
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
          id
          stageNumber
          levelNumber
          template {
            id
            name
            code
            version
            status
          }
        }
      }
    }
    templateActions(filter: { parametersQueriesString: { includes: $name } }) {
      nodes {
        id
        actionCode
        condition
        parameterQueries
        trigger
        template {
          code
          name
          version
          status
        }
      }
    }
    templateElements(filter: { parametersString: { includes: $name } }) {
      nodes {
        id
        code
        parameters
        title
        section {
          template {
            code
            name
            status
            version
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
