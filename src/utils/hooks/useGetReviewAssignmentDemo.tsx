import { useEffect, useState } from 'react'
import {
  GetReviewAssignmentQuery,
  Review,
  ReviewAssignment,
  ReviewQuestionAssignment,
  ReviewResponse,
  ReviewStatus,
  useGetReviewAssignmentDemoQuery,
  User,
} from '../generated/graphql'
import useLoadSectionsStructure from '../../utils/hooks/useLoadSectionsStructure'
import { AssignmentDetails, SectionsStructure, User as UserType } from '../types'
import getAssignedQuestions from '../helpers/review/getAssignedQuestions'
import { useUserState } from '../../contexts/UserState'
import updateSectionsReviews from '../helpers/structure/updateSectionsReviews'

interface UseGetReviewAssignmentProps {
  reviewerId: number
  serialNumber: string
}

const useGetReviewAssignment = ({ reviewerId, serialNumber }: UseGetReviewAssignmentProps) => {
  const [reviewerAssignments, setAssignments] = useState<any>()
  // const [sectionsAssigned, setSectionsAssigned] = useState<SectionsStructure>()
  const [assignmentError, setAssignmentError] = useState<string>()
  const {
    userState: { currentUser },
  } = useUserState()

  const { data, error } = useGetReviewAssignmentDemoQuery({
    variables: {
      reviewerId,
      applicationSerialNumber: serialNumber,
    },
  })

  // const getReview = (
  //   data: GetReviewAssignmentQuery | undefined
  // ): { review?: Review; currentAssignment: ReviewAssignment } | undefined => {
  //   const reviewerAssignments = data?.reviewAssignments?.nodes as ReviewAssignment[]

  //   // Should have only 1 review assignment per applicaton, stage and reviewer
  //   if (reviewerAssignments.length === 0) {
  //     setAssignmentError('No assignments in this review')
  //     return undefined
  //   }

  //   // TODO: There might be cases when we have more than one assignemnt to the same reviewer
  //   // in that case we would be displaying 2 different actions OR considering to add a reviewer
  //   // level to the URL so we can show separated pages for the Review and consolidation.
  //   const currentAssignment = reviewerAssignments[0]
  //   const reviews = currentAssignment.reviews.nodes as Review[]

  //   // Should have only 1 review per application, stage and reviewer
  //   const review = reviews.length > 0 ? reviews[0] : undefined

  //   return {
  //     review,
  //     currentAssignment,
  //   }
  // }

  useEffect(() => {
    if (error) setAssignmentError('something went wrong')
    if (data && data.reviewAssignments) {
      setAssignments(data.reviewAssignments.nodes)
      // const foundReview = getReview(data)
      // if (!foundReview) return
      // const { review, currentAssignment } = foundReview
      // const reviewQuestions = currentAssignment.reviewQuestionAssignments
      //   .nodes as ReviewQuestionAssignment[]

      // setAssignment({
      //   id: currentAssignment.id,
      //   review: review ? { id: review.id, status: review.status as ReviewStatus } : undefined,
      //   questions: getAssignedQuestions({ reviewQuestions }),
      // })

      // if (sectionsStructure && review) {
      //   const reviewResponses = review.reviewResponses.nodes as ReviewResponse[]
      //   const reviewer = currentAssignment.reviewer as User
      //   const sectionsWithReviews = updateSectionsReviews({
      //     sectionsStructure,
      //     reviewResponses,
      //     reviewer,
      //   })
      //   setSectionsAssigned(sectionsWithReviews)
      // }
    }
  }, [data, error])

  return {
    error,
    // loading: applicationLoading || apolloLoading,
    // application,
    reviewerAssignments,
    // sectionsAssigned,
  }
}

export default useGetReviewAssignment
