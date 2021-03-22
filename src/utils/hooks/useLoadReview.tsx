import { useEffect, useState } from 'react'
import {
  ReviewResponse,
  ReviewStatus,
  ReviewStatusHistory,
  useGetReviewQuery,
  useGetReviewStatusQuery,
  User,
} from '../generated/graphql'
import { SectionsStructure, User as UserType } from '../types'
import useTriggerProcessing from './useTriggerProcessing'
import { useUserState } from '../../contexts/UserState'
import useLoadSectionsStructure from './useLoadSectionsStructure'
import { updateSectionsReviews } from '../helpers/structure'

// TODO: Remove this
interface UseLoadReviewProps {
  reviewId: number
  serialNumber: string
}

const useLoadReview = ({ reviewId, serialNumber }: UseLoadReviewProps) => {
  const [applicationName, setApplicationName] = useState<string>('')
  const [reviewSections, setReviewSections] = useState<SectionsStructure>()
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>()
  const [isReviewReady, setIsReviewReady] = useState(false)
  const [isReviewLoaded, setIsReviewLoaded] = useState(false)
  const [reviewError, setReviewError] = useState<string>()
  const {
    userState: { currentUser },
  } = useUserState()

  const {
    error: structureError,
    application,
    allResponses,
    sectionsStructure,
    isApplicationReady,
  } = useLoadSectionsStructure({
    serialNumber: serialNumber as string,
    currentUser: currentUser as UserType,
  })

  const { data, error, loading, refetch } = useGetReviewQuery({
    variables: {
      reviewId,
    },
    skip: !isApplicationReady,
    fetchPolicy: 'network-only',
  })

  const { error: triggerError, isTriggerProcessing } = useTriggerProcessing({
    isReviewLoaded: isReviewReady,
    reviewId,
    // triggerType: 'reviewTrigger',
  })

  const { data: statusData, error: statusError } = useGetReviewStatusQuery({
    variables: {
      reviewId,
    },
    skip: !isReviewLoaded || isTriggerProcessing,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (!data) return

    if (!loading && !data?.review) {
      setReviewError('No review found')
    }

    if (application) setApplicationName(application.name)
    if (data?.review?.reviewResponses && sectionsStructure && isApplicationReady) {
      const reviewResponses = data.review.reviewResponses.nodes as ReviewResponse[]
      const reviewer = data.review.reviewer as User
      const reviewStructure = updateSectionsReviews({
        sectionsStructure,
        reviewResponses,
        reviewer,
      })

      setReviewSections(reviewStructure)
      setIsReviewLoaded(true)
    }
  }, [data, isApplicationReady])

  useEffect(() => {
    if (!statusData) return
    const statuses = statusData?.reviewStatusHistories?.nodes as ReviewStatusHistory[]
    if (statuses.length > 1) console.log('More than one status resulted for 1 review!')

    const { status } = statuses[0] // Should only have one result
    setReviewStatus(status as ReviewStatus)
    setIsReviewReady(true)
  }, [statusData])

  return {
    applicationName,
    isReviewReady,
    reviewSections,
    reviewStatus,
    allResponses,
    refetch,
    error: error
      ? (error.message as string)
      : statusError
      ? (statusError.message as string)
      : structureError || reviewError || triggerError,
  }
}

export default useLoadReview
