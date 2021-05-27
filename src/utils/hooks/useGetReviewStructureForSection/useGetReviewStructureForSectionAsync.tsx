import { useState, useEffect } from 'react'
import { useUserState } from '../../../contexts/UserState'
import { useGetReviewResponsesQuery } from '../../generated/graphql'
import { UseGetReviewStructureForSectionProps, FullStructure } from '../../types'
import {
  getSectionIds,
  generateReviewStructure,
  compileVariablesForReviewResponseQuery,
} from './helpers'

interface AwaitModeResolver {
  awaitMethod: (result: FullStructure | null) => void
}

const useGetReviewStructureForSectionAsync = (props: UseGetReviewStructureForSectionProps) => {
  const {
    userState: { currentUser },
  } = useUserState()

  const [awaitModeResolver, setAwaitModeResolver] = useState<AwaitModeResolver | null>(null)

  const sectionIds = getSectionIds(props)

  const { data, error } = useGetReviewResponsesQuery({
    variables: compileVariablesForReviewResponseQuery({ ...props, sectionIds, currentUser }),
    fetchPolicy: 'network-only',
    skip: !awaitModeResolver,
  })

  useEffect(() => {
    if (error) {
      console.log(error)
      if (awaitModeResolver) awaitModeResolver.awaitMethod(null)
      return
    }
    if (!data) return

    const newStructure = generateReviewStructure({ ...props, currentUser, data, sectionIds })
    if (awaitModeResolver) awaitModeResolver.awaitMethod(newStructure)
  }, [data, error])

  const getFullReviewStructureAsync = () =>
    new Promise<FullStructure>((resolve, reject) => {
      const awaitMethod = (newStructure: FullStructure | null) => {
        if (!newStructure) return reject(new Error('Failed to load structure'))
        resolve(newStructure)
        setAwaitModeResolver(null)
      }

      setAwaitModeResolver({ awaitMethod })
    })

  return getFullReviewStructureAsync
}

export default useGetReviewStructureForSectionAsync
