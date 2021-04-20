import { cloneDeep } from '@apollo/client/utilities'
import {
  GetReviewResponsesQuery,
  ReviewResponse,
  ReviewQuestionAssignment,
  TemplateElement,
} from '../../generated/graphql'
import {
  addElementsById,
  addSortedSectionsAndPages,
  addThisReviewResponses,
  generateReviewProgress,
  generateReviewSectionActions,
} from '../../helpers/structure'
import {
  UseGetReviewStructureForSectionProps,
  User,
  FullStructure,
  SectionState,
} from '../../types'

const getSectionIds = ({
  fullApplicationStructure,
  filteredSectionIds,
}: UseGetReviewStructureForSectionProps) =>
  filteredSectionIds ||
  Object.values(fullApplicationStructure.sections).map((section) => section.details.id) ||
  []

type GenerateReviewStructure = (
  props: UseGetReviewStructureForSectionProps & {
    currentUser?: User | null
    sectionIds: number[]
    data: GetReviewResponsesQuery
  }
) => FullStructure

const generateReviewStructure: GenerateReviewStructure = ({
  data,
  fullApplicationStructure,
  reviewAssignment,
  currentUser,
  sectionIds,
}) => {
  // requires deep clone one we have concurrent useGetFullReviewStructure that could possibly
  // mutate fullApplicationStructure
  let newStructure: FullStructure = cloneDeep(fullApplicationStructure)

  // This is usefull for linking assignments to elements
  newStructure = addElementsById(newStructure)
  newStructure = addSortedSectionsAndPages(newStructure)

  newStructure = addIsAssigned(newStructure, reviewAssignment.reviewQuestionAssignments)

  // here we add responses from other review (not from this review assignmnet)

  setIsNewApplicationResponse(newStructure)

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
  return newStructure
}

const setIsNewApplicationResponse = (structure: FullStructure) => {
  Object.values(structure.elementsById || {}).forEach((element) => {
    element.isNewApplicationResponse =
      element?.latestApplicationResponse?.timeUpdated === structure.info.current?.date &&
      !!element?.previousApplicationResponse
  })
}

const getFilteredSections = (sectionIds: number[], sections: SectionState[]) => {
  return sections.filter((section) =>
    sectionIds.find((sectionId) => section.details.id === sectionId)
  )
}

const addIsAssigned = (
  newStructure: FullStructure,
  reviewQuestionAssignment: ReviewQuestionAssignment[]
) => {
  reviewQuestionAssignment.forEach(({ templateElement, id }) => {
    const { id: templateElementId } = templateElement as TemplateElement
    const assignedElement = newStructure?.elementsById?.[templateElementId || '']

    if (!assignedElement) return

    assignedElement.isAssigned = true
    assignedElement.assignmentId = id
  })
  return newStructure
}

export { generateReviewStructure, getSectionIds }
