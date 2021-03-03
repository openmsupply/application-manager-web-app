import { useState, useEffect } from 'react'
import { FullStructure } from '../types'
import {
  ApplicationResponse,
  Review,
  ReviewAssignment,
  ReviewResponse,
  useGetReviewNewQuery,
} from '../generated/graphql'
import addEvaluatedResponsesToStructure from '../helpers/structure/addEvaluatedResponsesToStructure'
import { useUserState } from '../../contexts/UserState'
import addOwnedReviewResponse from '../helpers/structure/addOwnedReviewResponse'

interface useGetFullApplicationStructureProps {
  structure: FullStructure
  reviewAssignment: ReviewAssignment
}

const useGetFullReviewStructure = ({
  structure,
  reviewAssignment,
}: useGetFullApplicationStructureProps) => {
  const [fullStructure, setFullStructure] = useState<FullStructure>()
  const [isError, setIsError] = useState(false)

  const {
    userState: { currentUser },
  } = useUserState()

  const { data, error } = useGetReviewNewQuery({
    variables: {
      reviewAssignmentId: reviewAssignment.id,
      userId: currentUser?.userId || 0,
    },
  })

  useEffect(() => {
    if (error) {
      setIsError(true)
      return
    }

    if (!data) return

    addEvaluatedResponsesToStructure({
      structure,
      applicationResponses: data?.reviewAssignment?.application?.applicationResponses
        ?.nodes as ApplicationResponse[],
      currentUser,
      evaluationOptions: {
        isEditable: false,
        isVisible: true,
        isRequired: false,
        isValid: false,
      },
    }).then((evaluatedStructure: FullStructure) => {
      let newStructure = evaluatedStructure

      // here we add reviewless review repsonses
      // generate indications of reviewless review response (numbe of non conform etc.)

      const review = data?.reviewAssignment?.reviews?.nodes[0] as Review
      if (review) {
        newStructure = addOwnedReviewResponse({
          structure: evaluatedStructure,
          sortedReviewResponses: review?.reviewResponses.nodes as ReviewResponse[], // Sorted in useGetReviewNewQuery
        })
      }

      // Generate review progress

      setFullStructure(newStructure)
    })
  }, [data, error])

  return {
    fullStructure,
    error: isError ? error : false,
  }
}

export default useGetFullReviewStructure
