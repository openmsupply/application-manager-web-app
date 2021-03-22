import { ApolloError } from '@apollo/client'
import { useState } from 'react'
import {
  CreateReviewMutation,
  Review,
  useCreateReviewMutation,
} from '../../utils/generated/graphql'
import getReviewAssignmentQuery from '../graphql/queries/getReviewAssignment.query'
import { FullStructure } from '../types'

export interface CreateReviewProps {
  applicationResponses: { applicationResponseId: number; reviewQuestionAssignmentId: number }[]
}

interface UseCreateReviewProps {
  reviewerId: number
  reviewAssigmentId: number
  serialNumber: string
  onCompleted: (id: number) => void
}

const useCreateReview = ({
  reviewerId,
  serialNumber,
  onCompleted,
  reviewAssigmentId,
}: UseCreateReviewProps) => {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<ApolloError | undefined>()

  const [createReviewMutation] = useCreateReviewMutation({
    // TODO: Remove this
    onCompleted: ({ createReview }: CreateReviewMutation) => {
      const { id } = createReview?.review as Review
      setProcessing(false)
      onCompleted(id)
    },
    // TODO: Remove this
    onError: (error) => {
      setProcessing(false)
      setError(error)
    },
    // TODO: Remove this
    refetchQueries: [
      {
        query: getReviewAssignmentQuery,
        variables: { reviewerId, serialNumber },
      },
    ],
  })

  const createReviewFromStructure = async (structure: FullStructure) => {
    const elements = Object.values(structure?.elementsById || {})
    const reviewableElements = elements.filter(
      (element) => element?.isAssigned && element?.response?.id && element?.response?.id != 0
    )

    const applicationResponses = reviewableElements.map((element) => ({
      applicationResponseId: element.response?.id || 0,
      reviewQuestionAssignmentId: element.assignmentId,
    }))

    return await createReviewMutation({
      variables: {
        reviewAssigmentId,
        applicationResponses,
      },
    })
  }
  // TODO: Remove this
  const createReview = ({ applicationResponses }: CreateReviewProps) => {
    setProcessing(true)
    createReviewMutation({
      variables: {
        reviewAssigmentId,
        applicationResponses,
      },
    })
  }

  return {
    processing,
    error,
    createReviewFromStructure,
    create: createReview,
  }
}

export default useCreateReview
