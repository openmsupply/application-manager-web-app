import { gql } from '@apollo/client'
import { buildFieldList } from '../utils'

const getDynamicSingleTable = (structure: any, gqlTableName: string) => gql`
    query getDynamicSingleTable {
      lookupTable${gqlTableName}s {
        nodes {
          ${buildFieldList(structure.fieldMap)}
        }
      }
    }
  `

export default getDynamicSingleTable
