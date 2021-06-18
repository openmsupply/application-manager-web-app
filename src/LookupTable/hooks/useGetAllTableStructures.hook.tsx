import { useEffect, useState } from 'react'
import { AllLookupTableStructuresType, LookUpTableType } from '../types'
import { useGetAllLookupTableStructuresQuery } from '../../utils/generated/graphql'

const useGetAllTableStructures = (): AllLookupTableStructuresType => {
  const [allTableStructures, setAllTableStructures] = useState<LookUpTableType[]>()

  const allTableStructuresLoadState = useGetAllLookupTableStructuresQuery({
    fetchPolicy: 'network-only',
  })

  const { data, loading, error, refetch: refetchAllTableStructures } = allTableStructuresLoadState

  useEffect(() => {
    if (!loading && !error && data?.lookupTables?.nodes) {
      setAllTableStructures(
        data.lookupTables.nodes.map((lookupTable: any) => ({
          ...lookupTable,
          isExpanded: false,
        }))
      )
    }
  }, [loading, error, data])

  return {
    allTableStructuresLoadState,
    allTableStructures,
    setAllTableStructures,
    refetchAllTableStructures,
  }
}

export default useGetAllTableStructures
