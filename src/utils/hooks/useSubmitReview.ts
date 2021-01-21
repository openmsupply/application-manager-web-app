import { useState } from 'react'
import {
  ReviewResponse,
  ReviewResponseDecision,
  useUpdateReviewMutation,
} from '../generated/graphql'
import { ReviewQuestionDecision } from '../types'
interface UseSubmitReviewProps {
  reviewId: number
}

const useSubmitReview = ({ reviewId }: UseSubmitReviewProps) => {
  const [submitted, setSubmitted] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const [submitReviewMutation] = useUpdateReviewMutation({
    onCompleted: () => setProcessing(false),
    onError: (submitionError) => {
      setError(submitionError.message)
      setProcessing(false)
    },
  })

  const submit = (reviewerResponses: ReviewQuestionDecision[]) => {
    setSubmitted(true)
    setProcessing(true)
    submitReviewMutation({
      variables: {
        reviewId,
        reviewResponses: reviewerResponses.map(({ id, decision, comment }) => ({
          id,
          patch: { decision: decision as ReviewResponseDecision, comment },
        })),
      },
    })
  }

  return {
    error,
    processing,
    submitted,
    submit,
  }
}

export default useSubmitReview