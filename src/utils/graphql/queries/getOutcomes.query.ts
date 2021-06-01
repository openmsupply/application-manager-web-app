import { gql } from '@apollo/client'

export default gql`
  query getOutcomes {
    outcomes {
      nodes {
        code
        detailColumnName
        id
        tableName
        title
        outcomeDetailViews {
          nodes {
            columnName
            elementTypePluginCode
            id
            parameters
            isTextColumn
            title
          }
        }
        outcomeTableViews {
          nodes {
            code
            columnName
            id
            title
          }
        }
      }
    }
  }
`
