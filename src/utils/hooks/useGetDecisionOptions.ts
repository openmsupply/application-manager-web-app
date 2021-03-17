import { useState, useEffect } from 'react'
import { Decision, ReviewStatus } from '../generated/graphql'
import strings from '../constants'
import { DecisionOption, ReviewDetails } from '../types'

const initilDecisionOptions: DecisionOption[] = [
  {
    code: Decision.ListOfQuestions,
    title: strings[Decision.ListOfQuestions],
    isVisible: false,
    value: false,
  },
  {
    code: Decision.NonConform,
    title: strings[Decision.NonConform],
    isVisible: false,
    value: false,
  },
  {
    code: Decision.Conform,
    title: strings[Decision.Conform],
    isVisible: false,
    value: false,
  },
  {
    code: Decision.ChangesRequested,
    title: strings[Decision.ChangesRequested],
    isVisible: false,
    value: false,
  },
]

// hook used to manage state of options shown in review submit, as per type definition below
type UseGetDecisionOptions = (
  canSubmitReviewAs?: Decision | null,
  thisReview?: ReviewDetails | null
) => {
  decisionOptions: DecisionOption[]
  getDecision: () => Decision
  setDecision: (decision: Decision) => void
  getAndSetDecisionError: () => boolean // may set decision error, which is reset automatically
  isDecisionError: boolean
}

const useGetDecisionOptions: UseGetDecisionOptions = (canSubmitReviewAs, thisReview) => {
  const [decisionOptions, setDecisionOptions] = useState<DecisionOption[]>(initilDecisionOptions)
  const [isDecisionError, setIsDecisionError] = useState(false)

  const isDraft = thisReview?.status === ReviewStatus.Draft
  const decisionInStructure = thisReview?.reviewDecision?.decision || Decision.NoDecision
  const reviewerNeedsToMakeDecision = thisReview?.isLastLevel || (thisReview?.level || 0) > 1

  useEffect(() => {
    setIsDecisionError(false)
    const updatedOptions = decisionOptions.map(({ code, title }) => {
      let isVisible = false
      let value = false
      // if review is NOT DRAFT then use decision from DB (and make it the only one visible)
      if (!isDraft) isVisible = value = code === decisionInStructure
      // if review IS DRAFT, can can submit review with non conform decision and reviewer has
      // ability to make a decsion, present them with NonConform or LOQ, both unchecked
      else if (canSubmitReviewAs === Decision.NonConform && reviewerNeedsToMakeDecision) {
        isVisible = code === Decision.NonConform || code === Decision.ListOfQuestions
        value = false
      }
      // if review IS DRAFT and other then non conform decision or reviewer can't make a decision
      // then use computed decision for the state of review
      else isVisible = value = code === canSubmitReviewAs

      return {
        code,
        title,
        isVisible,
        value,
      }
    })
    setDecisionOptions(updatedOptions)
  }, [canSubmitReviewAs, thisReview])

  const getDecision = () =>
    decisionOptions.find((option) => option.value)?.code || Decision.NoDecision

  const setDecision = (decision: Decision) => {
    if (decision === Decision.NonConform || decision == Decision.ListOfQuestions)
      setIsDecisionError(false)
    setDecisionOptions(
      decisionOptions.map((option) => ({ ...option, value: option.code === decision }))
    )
  }

  const getAndSetDecisionError = () => {
    if (!reviewerNeedsToMakeDecision) return false
    const isDecisionError =
      canSubmitReviewAs === Decision.NonConform && getDecision() === Decision.NoDecision

    setIsDecisionError(isDecisionError)
    return isDecisionError
  }

  return { decisionOptions, getDecision, setDecision, getAndSetDecisionError, isDecisionError }
}

export default useGetDecisionOptions
