import { useState, useEffect } from 'react'
import { useUserState } from '../../../contexts/UserState'
import { useGetReviewResponsesQuery } from '../../generated/graphql'
import { UseGetReviewStructureForSectionProps, FullStructure } from '../../types'
import { getSectionIds, generateReviewStructure } from './helpers'

const useGetReviewStructureForSections = (props: UseGetReviewStructureForSectionProps) => {
  const [fullReviewStructure, setFullReviewStructure] = useState<FullStructure>()
  const {
    userState: { currentUser },
  } = useUserState()

  const sectionIds = getSectionIds(props)

  const { data, error } = useGetReviewResponsesQuery({
    variables: {
      reviewAssignmentId: props.reviewAssignment.id as number,
      sectionIds,
      userId: currentUser?.userId as number,
    },
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
