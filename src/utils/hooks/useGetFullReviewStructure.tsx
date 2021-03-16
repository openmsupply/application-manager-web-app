import { useState, useEffect } from 'react'
import { AssignmentDetailsNEW, FullStructure, SectionStateNEW } from '../types'
import {
  ReviewQuestionAssignment,
  ReviewResponse,
  useGetReviewResponsesQuery,
} from '../generated/graphql'
import { useUserState } from '../../contexts/UserState'
import addThisReviewResponses from '../helpers/structure/addThisReviewResponses'
import addElementsById from '../helpers/structure/addElementsById'
import generateReviewProgress from '../helpers/structure/generateReviewProgress'
import { cloneDeep } from '@apollo/client/utilities'
import generateReviewSectionActions from '../helpers/structure/generateReviewSectionActions'
import addSortedSectionsAndPages from '../helpers/structure/addSortedSectionsAndPages'

interface useGetFullReviewStructureProps {
  fullApplicationStructure: FullStructure
  reviewAssignment: AssignmentDetailsNEW
  filteredSectionIds?: number[]
}

const useGetFullReviewStructure = ({
  fullApplicationStructure,
  reviewAssignment,
  filteredSectionIds,
}: useGetFullReviewStructureProps) => {
  const [fullReviewStructure, setFullReviewStructure] = useState<FullStructure>()

  const {
    userState: { currentUser },
  } = useUserState()

  // filter by all sections if sections are not supplied
  const sectionIds =
    filteredSectionIds ||
    Object.values(fullApplicationStructure.sections).map((section) => section.details.id) ||
    []

  const { data, error } = useGetReviewResponsesQuery({
    variables: {
      reviewAssignmentId: reviewAssignment.id as number,
      userId: currentUser?.userId as number,
      sectionIds,
    },
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (error) return

    if (!data) return
    // requires deep clone one we have concurrent useGetFullReviewStructure that could possibly
    // mutate fullApplicationStructure
    let newStructure: FullStructure = cloneDeep(fullApplicationStructure)

    // This is usefull for linking assignments to elements
    newStructure = addElementsById(newStructure)
    newStructure = addSortedSectionsAndPages(newStructure)

    newStructure = addIsAssigned(newStructure, reviewAssignment.reviewQuestionAssignments)

    // here we add responses from other review (not from this review assignmnet)

    if ((data.reviewAssignment?.reviews?.nodes?.length || 0) > 1)
      console.error(
        'More then one review associated with reviewAssignment with id',
        reviewAssignment.id
      )
    // There will always just be one review assignment linked to a review. (since review is related to reviewAssignment, many to one relation is created)
    const reviewResponses = data?.reviewAssignment?.reviews?.nodes[0]?.reviewResponses.nodes
    if (reviewResponses) {
      newStructure = addThisReviewResponses({
        structure: newStructure,
        sortedReviewResponses: reviewResponses as ReviewResponse[], // Sorted in useGetReviewResponsesQuery
      })
    }
    // review info comes from reviewAssignment that's passed to this hook
    newStructure.thisReview = reviewAssignment.review

    generateReviewProgress(newStructure)

    // filter by supplied sections or by all sections if none supplied to the hook
    const sections = getFilteredSections(sectionIds, newStructure.sortedSections || [])
    generateReviewSectionActions({
      sections,
      reviewAssignment,
      thisReview: newStructure.thisReview,
      currentUserId: currentUser?.userId as number,
    })

    // generateConsolidationProgress
    setFullReviewStructure(newStructure)
  }, [data, error])

  return {
    fullReviewStructure,
    error: error?.message,
  }
}

const getFilteredSections = (sectionIds: number[], sections: SectionStateNEW[]) => {
  return sections.filter((section) =>
    sectionIds.find((sectionId) => section.details.id === sectionId)
  )
}

const addIsAssigned = (
  newStructure: FullStructure,
  reviewQuestionAssignment: ReviewQuestionAssignment[]
) => {
  reviewQuestionAssignment.forEach(({ templateElementId, id }) => {
    const assignedElement = newStructure?.elementsById?.[templateElementId || '']

    if (!assignedElement) return

    assignedElement.isAssigned = true
    assignedElement.assignmentId = id
  })
  return newStructure
}

export default useGetFullReviewStructure
