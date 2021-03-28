import { useEffect, useState } from 'react'
import {
  AssignmentDetailsNEW,
  AssignmentStructure,
  AssignmentStructureLevel,
  GraphQLUser,
  AssignmentStructureLevels,
  AssignmentStructureSections,
  FullStructure,
} from '../types'
import {
  Review,
  ReviewAssignment,
  ReviewAssignmentStatus,
  ReviewQuestionAssignment,
  ReviewStatus,
  useGetReviewInfoQuery,
  User,
} from '../generated/graphql'
import messages from '../messages'
import { useUserState } from '../../contexts/UserState'

const MAX_REFETCH = 10
interface UseGetReviewInfoProps {
  structure: FullStructure
  applicationId: number
  userId: number
}

const useGetReviewInfo = ({ applicationId }: UseGetReviewInfoProps, structure) => {
  const [assignments, setAssignments] = useState<AssignmentDetailsNEW[]>()
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
    // Checking if any of reviews trigger is running before refetching assignments
    // This is done to get latest status for reviews (afte trigger finishes to run)
    if (reviews.every((review) => !review || review?.trigger === null)) {
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

    const assignments: AssignmentDetailsNEW[] = reviewAssigments.map((reviewAssignment) => {
      // There will always just be one review assignment linked to a review.
      const review = reviewAssignment.reviews.nodes[0] as Review
      if (reviewAssignment.reviews.nodes.length > 1)
        console.error(
          'More then one review associated with reviewAssignment with id',
          reviewAssignment.id
        )

      const {
        id,
        status,
        stage: assignmentStage,
        timeCreated,
        level,
        reviewer,
        reviewAssignmentAssignerJoins,
        templateSectionRestrictions,
      } = reviewAssignment

      // Extra field just to use in initial example - might conflict with future queries
      // to get reviewQuestionAssignment
      const reviewQuestionAssignments = (reviewAssignment.reviewQuestionAssignments.nodes ||
        []) as ReviewQuestionAssignment[]
      const totalAssignedQuestions = reviewQuestionAssignments.length

      const stage = { id: assignmentStage?.id as number, name: assignmentStage?.title as string }

      const assignment: AssignmentDetailsNEW = {
        id,
        review: review
          ? {
              id: review.id,
              status: review.status as ReviewStatus,
              timeStatusCreated: review.timeStatusCreated,
              isLastLevel: !!review?.isLastLevel,
              level: review.level || 0,
              stage,
              reviewDecision: review.reviewDecisions.nodes[0], // this will be the latest, sorted in query
            }
          : null,
        status,
        stage,
        reviewer: reviewer as User,
        level: level || 1,
        isCurrentUserReviewer: reviewer?.id === (currentUser?.userId as number),
        isCurrentUserAssigner: reviewAssignmentAssignerJoins.nodes.length > 0,
        assigners: reviewAssignmentAssignerJoins?.nodes?.map(
          (node) => node?.assigner as GraphQLUser
        ),
        assignableSectionRestrictions: templateSectionRestrictions || [],
        totalAssignedQuestions,
        reviewQuestionAssignments,
        timeCreated,
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

const constructAssignmentInfo = (
  reviewAssignments: AssignmentDetailsNEW[],
  structure: FullStructure
) => {
  const result: AssignmentStructure = {}
  const destinctStages: { [key: string]: boolean } = {}
  reviewAssignments.forEach(
    (reviewAssignment) => (destinctStages[reviewAssignment.stage.id] = true)
  )

  const reviewAssignmentsForStage = (stageId: string) =>
    reviewAssignments.filter((reviewAssignment) => Number(stageId) === reviewAssignment.stage.id)

  Object.keys(destinctStages).forEach(
    (stageId) =>
      (result[stageId] = constructAssignmentInfoForStage(
        reviewAssignmentsForStage(stageId),
        structure
      ))
  )

  return result
}

const constructAssignmentInfoForStage = (
  reviewAssignments: AssignmentDetailsNEW[],
  structure: FullStructure
) => {
  const sections: AssignmentStructureSections = {}
  Object.values(structure.sections).forEach(
    (section) =>
      (sections[section.details.code] = constructAssignmentInfoForSection(
        reviewAssignments,
        section.details.code
      ))
  )
  return { ...sections }
}

const constructAssignmentInfoForSection = (
  reviewAssignments: AssignmentDetailsNEW[],
  sectionCode: string
) => {
  const levels: AssignmentStructureLevels = {}

  const distinctLevels: { [key: string]: boolean } = {}
  reviewAssignments.forEach((reviewAssignment) => (distinctLevels[reviewAssignment.level] = true))

  const reviewAssignmentsForLevel = (level: string) =>
    reviewAssignments.filter((reviewAssignment) => Number(level) === reviewAssignment.level)
  Object.keys(distinctLevels).forEach(
    (level) =>
      (levels[level] = constructAssignmentInfoForLevel(
        reviewAssignmentsForLevel(level),
        sectionCode
      ))
  )

  return { ...levels }
}

const constructAssignmentInfoForLevel = (
  reviewAssignments: AssignmentDetailsNEW[],
  sectionCode: string
) => {
  const assigners: { [key: string]: GraphQLUser } = {}
  const assignedReviewers: { [key: string]: GraphQLUser } = {}
  const availableReviewers: { [key: string]: GraphQLUser } = {}
  const selfAssignableReviewers: { [key: string]: GraphQLUser } = {}

  reviewAssignments.forEach((reviewAssignment) => {
    reviewAssignment.assigners.forEach((assigner) => (assigners[assigner.id] = assigner))

    const reviewAssignmentsForSection = reviewAssignments.filter(
      (reviewAssignment) =>
        reviewAssignment.assignableSectionRestrictions.length === 0 ||
        reviewAssignment.assignableSectionRestrictions.includes(sectionCode)
    )
    reviewAssignmentsForSection.forEach(
      ({ reviewer }) => (availableReviewers[reviewer.id] = reviewer)
    )

    const reviewAssignmentsAssignedForSection = reviewAssignments.filter((reviewAssignment) =>
      reviewAssignment.reviewQuestionAssignments.some(
        ({ templateElement }) => templateElement?.section?.code === sectionCode
      )
    )
    reviewAssignmentsAssignedForSection.forEach(
      ({ reviewer }) => (assignedReviewers[reviewer.id] = reviewer)
    )
  })

  return {
    assigners: Object.values(assigners),

    assignedReviewers: Object.values(assignedReviewers),
    availableReviewers: Object.values(assignedReviewers),
    selfAssignableReviewers: Object.values(selfAssignableReviewers),
  }
}

//   //  return {sectionCode: }
// }

// const constructAssignmentInfoForLevel = (reviewAssignments: AssignmentDetailsNEW[], structure: FullStructure) => {
// interface AssignmentInfo {
//   stage_id: number
//   sections: {
//     [sectionCode: string]: {
//       [levelNumber: string]: {
//         assigners: [GraphQLUser]
//         assignedReviewers: [GraphQLUser]
//         availableReviewers: [GraphQLUser]
//         selfAssignableReviewers: [GraphQLUser]
//       }
//     }
//   }
// }

export default useGetReviewInfo
