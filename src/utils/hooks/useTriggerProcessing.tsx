import { useState, useEffect } from 'react'
import { useGetTriggersQuery } from '../../utils/generated/graphql'

// TODO: Remove this

type TriggerType = 'applicationTrigger' | 'reviewAssignmentTrigger' | 'reviewTrigger'

interface TriggerApplication {
  isApplicationLoaded: boolean
  serialNumber: string
}
interface TriggerReview {
  isReviewLoaded: boolean
  reviewId: number
}
interface TriggerAssignment {
  reviewAssignmentId: number
}
type TriggerQueryProps = { triggerType?: TriggerType } & (
  | TriggerApplication
  | TriggerReview
  | TriggerAssignment
)

const useTriggerProcessing = ({ triggerType, ...props }: TriggerQueryProps) => {
  const [isProcessing, setIsProcessing] = useState(true)
  const [triggerError, setTriggerError] = useState<string>()

  // If triggerType not provided, infer it from the supplied ID
  const inferredTriggerType = inferTriggerType(triggerType, props)

  if (!inferredTriggerType) {
    setIsProcessing(false)
    setTriggerError('Invalid trigger type')
  }

  const { serialNumber, isApplicationLoaded } = props as TriggerApplication
  const { reviewAssignmentId } = props as TriggerAssignment
  const { reviewId, isReviewLoaded } = props as TriggerReview

  // Skip processing the trigger using one of the following flags (depending on trigger type)
  let skipTrigger =
    isApplicationLoaded !== undefined
      ? !isApplicationLoaded
        ? isReviewLoaded !== undefined
        : !isReviewLoaded
      : true

  const { data, loading, error } = useGetTriggersQuery({
    variables: {
      serial: serialNumber,
      reviewAssignmentId,
      reviewId,
    },
    pollInterval: 500,
    skip: skipTrigger && !isProcessing,
    fetchPolicy: 'network-only',
  })

  useEffect((): any => {
    const triggers = data?.applicationTriggerStates?.nodes?.[0]
    if (triggers) {
      if (triggers[inferredTriggerType as TriggerType] === null) setIsProcessing(false)
    }
  }, [data, loading, skipTrigger])

  return {
    isTriggerProcessing: isProcessing,
    error: error ? (error.message as string) : triggerError,
  }
}
export default useTriggerProcessing

function inferTriggerType(
  triggerType: TriggerType | undefined,
  receivedProps: TriggerApplication | TriggerReview | TriggerAssignment
): TriggerType | null {
  return triggerType
    ? triggerType
    : (receivedProps as TriggerApplication)
    ? 'applicationTrigger'
    : (receivedProps as TriggerAssignment)
    ? 'reviewAssignmentTrigger'
    : (receivedProps as TriggerReview)
    ? 'reviewTrigger'
    : null
}
