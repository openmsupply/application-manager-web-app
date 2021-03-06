import { gql } from '@apollo/client'
import { buildFieldList, capitalizeFirstLetter, toCamelCase } from '../utils'

const getDynamicSingleTable = (structure: any) => gql`
    query getDynamicSingleTable {
      lookupTable${capitalizeFirstLetter(toCamelCase(structure.name))}s {
        nodes {
          ${buildFieldList(structure.fieldMap)}
        }
      }
    }
  `

export default getDynamicSingleTable
