import { gql } from '@apollo/client'

export default gql`
  query getOutcomeDisplays {
    outcomeDisplays {
      nodes {
        code
        detailColumnName
        id
        pluralTableName
        tableName
        title
        outcomeDisplayTables {
          nodes {
            columnName
            id
            isTextColumn
            title
          }
        }
        outcomeDisplayDetails {
          nodes {
            columnName
            elementTypePluginCode
            isTextColumn
            id
            title
            parameters
          }
        }
      }
    }
  }
`
