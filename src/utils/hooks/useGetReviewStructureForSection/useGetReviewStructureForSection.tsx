import { useState, useEffect } from 'react'
import { useUserState } from '../../../contexts/UserState'
import { useGetReviewResponsesQuery } from '../../generated/graphql'
import { UseGetReviewStructureForSectionProps, FullStructure } from '../../types'
import {
  getSectionIds,
  generateReviewStructure,
  compileVariablesForReviewResponseQuery,
} from './helpers'

const useGetReviewStructureForSections = (props: UseGetReviewStructureForSectionProps) => {
  const [fullReviewStructure, setFullReviewStructure] = useState<FullStructure>()
  const {
    userState: { currentUser },
  } = useUserState()

  const sectionIds = getSectionIds(props)

  const { data, error } = useGetReviewResponsesQuery({
    variables: compileVariablesForReviewResponseQuery({ ...props, sectionIds, currentUser }),
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (error) return
    if (!data) return

    setFullReviewStructure(generateReviewStructure({ ...props, currentUser, data, sectionIds }))
  }, [data, error])

  return {
    fullReviewStructure,
    error: error?.message,
  }
}

export default useGetReviewStructureForSections
