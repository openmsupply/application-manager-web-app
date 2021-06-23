import { useEffect, useState } from 'react'
import { AssignmentDetails } from '../types'
import {
  Review,
  ReviewAssignment,
  ReviewQuestionAssignment,
  ReviewStatus,
  useGetReviewInfoQuery,
  User,
} from '../generated/graphql'
import messages from '../messages'
import { useUserState } from '../../contexts/UserState'

const MAX_REFETCH = 10
interface UseGetReviewInfoProps {
  applicationId: number
  userId: number
}

const useGetReviewInfo = ({ applicationId }: UseGetReviewInfoProps) => {
  const [assignments, setAssignments] = useState<AssignmentDetails[]>()
  const [isFetching, setIsFetching] = useState(true)
  const [fetchingError, setFetchingError] = useState('')
  const [refetchAttempts, setRefetchAttempts] = useState(0)
  const {
    userState: { currentUser },
  } = useUserState()

  const { data, loading, error, refetch } = useGetReviewInfoQuery({
    variables: {
      applicationId,
      assignerId: currentUser?.userId as number,
    },
    notifyOnNetworkStatusChange: true,
    // if this is removed, there might be an infinite loading when looking at a review for the frist time, after clearing cache
    // it's either this or removing 'totalCount' in `reviewQuestionAssignments` from this query
    // ended up removing totalCount from query and keeping this as nextFetchPolicy (was still seeing glitched with totalCount and had "can't update unmounted component error")
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (loading) return setIsFetching(true)

    if (!data) return

    const reviewAssigments = data.reviewAssignments?.nodes as ReviewAssignment[]

    // Current user has no assignments
    if (!reviewAssigments) {
      setIsFetching(false)
      return
    }

    const reviews: Review[] = reviewAssigments.map(({ reviews }) => reviews.nodes[0] as Review)
    // Checking if any of reviews or reviewAssignment trigger is running before refetching assignments
    // This is done to get latest status for reviews & assignment (afte trigger finishes to run)
    if (
      reviews.every((review) => !review || review?.trigger === null) &&
      reviewAssigments.every(
        (reviewAssignment) => !reviewAssigments || reviewAssignment?.trigger === null
      )
    ) {
      setRefetchAttempts(0)
    } else {
      if (refetchAttempts < MAX_REFETCH) {
        setTimeout(() => {
          console.log('Will refetch getReviewInfo', refetchAttempts) // TODO: Remove log
          setRefetchAttempts(refetchAttempts + 1)
          refetch()
        }, 500)
      } else setFetchingError(messages.TRIGGER_RUNNING)
      return
    }

    const assignments: AssignmentDetails[] = reviewAssigments.map((reviewAssignment) => {
      // There will always just be one review assignment linked to a review.
      const review = reviewAssignment.reviews.nodes[0] as Review
      if (reviewAssignment.reviews.nodes.length > 1)
        console.error(
          'More then one review associated with reviewAssignment with id',
          reviewAssignment.id
        )

      const {
        id,
        status: assignmentStatus,
        stage: assignmentStage,
        stageDate,
        timeUpdated,
        levelNumber,
        reviewer,
        reviewAssignmentAssignerJoins,
        allowedSections,
      } = reviewAssignment

      // Extra field just to use in initial example - might conflict with future queries
      // to get reviewQuestionAssignment
      const reviewQuestionAssignments = (reviewAssignment.reviewQuestionAssignments.nodes ||
        []) as ReviewQuestionAssignment[]
      const totalAssignedQuestions = reviewQuestionAssignments.length

      const stage = {
        id: assignmentStage?.id as number,
        name: assignmentStage?.title as string,
        number: assignmentStage?.number as number,
        colour: assignmentStage?.colour as string,
        createdDate: stageDate,
      }

      const assignment: AssignmentDetails = {
        id,
        review: review
          ? {
              id: review.id,
              isLastLevel: !!review?.isLastLevel,
              level: review.levelNumber || 0,
              stage: {
                ...stage,
                statusCreatedDate: review.timeStatusCreated,
                status: review.status as ReviewStatus,
              },
              reviewDecision: review.reviewDecisions.nodes[0], // this will be the latest, sorted in query
              reviewer: reviewer as User,
            }
          : null,
        stage, // No status defined (ReviewStatus is defined inside review)
        status: assignmentStatus,
        reviewer: reviewer as User,
        level: levelNumber || 1,
        isCurrentUserReviewer: reviewer?.id === (currentUser?.userId as number),
        isCurrentUserAssigner: reviewAssignmentAssignerJoins.nodes.length > 0,
        assignableSectionRestrictions: allowedSections || [],
        totalAssignedQuestions,
        reviewQuestionAssignments,
        timeUpdated,
      }

      return assignment
    })

    setAssignments(assignments)
    setIsFetching(false)
  }, [data, loading])

  return {
    error: fetchingError || error?.message,
    loading: loading || isFetching,
    assignments,
  }
}

export default useGetReviewInfo
