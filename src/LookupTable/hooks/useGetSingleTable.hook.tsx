import { gql, useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { getDynamicSingleTable } from '../graphql'
import { capitalizeFirstLetter, toCamelCase } from '../utils'

const initialStructureState: any = {
  data: [],
  loading: true,
  called: false,
  error: {},
}

const useGetSingleTable = () => {
  const GQL_TABLE_NAME_PREFIX = 'lookupTable'

  const [structure, setStructure]: any = useState(initialStructureState)

  const [dynamicQuery, setDynamicQuery] = useState(gql`
    query {
      nodeId
    }
  `)

  const [getSingleTable, singleTableLoadState] = useLazyQuery(dynamicQuery, {
    fetchPolicy: 'network-only',
  })

  const { called, loading, data, error } = singleTableLoadState

  const [lookupTable, setLookupTable] = useState(null)

  useEffect(() => {
    if (structure?.id) {
      setDynamicQuery(getDynamicSingleTable(structure))

      // Note: After we have updated the structure and added/updated row is successful, structure query
      // successfully brings the updated structure but the lookup table call says the newly added field is
      // not there (probably the graphql schema is being updated). A half a second wait before making
      // the query fixes it so I decided to fix it lazy for now.
      setTimeout(() => getSingleTable(), 500)
    }
  }, [structure])

  useEffect(() => {
    if (structure?.name) {
      const tableName = `${GQL_TABLE_NAME_PREFIX}${capitalizeFirstLetter(
        toCamelCase(structure.name)
      )}s`

      if (!loading && called && !error && data[tableName]) {
        setLookupTable(data[tableName].nodes)
      }
    }
  }, [loading, called, data, error, structure])

  return { singleTableLoadState, structure, lookupTable, setStructure }
}

export default useGetSingleTable
