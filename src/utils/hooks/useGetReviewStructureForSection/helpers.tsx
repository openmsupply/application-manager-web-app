import { cloneDeep } from '@apollo/client/utilities'
import {
  GetReviewResponsesQuery,
  ReviewResponse,
  ReviewQuestionAssignment,
  TemplateElement,
  ReviewResponseStatus,
  ReviewStatus,
} from '../../generated/graphql'
import {
  addChangeRequestForReviewer,
  addElementsById,
  addSortedSectionsAndPages,
  generateConsolidationValidity,
  generateConsolidatorResponsesProgress,
  generateReviewerChangesRequestedProgress,
  generateReviewerResponsesProgress,
  generateReviewSectionActions,
  generateReviewValidity,
} from '../../helpers/structure'
import addReviewResponses from '../../helpers/structure/addReviewResponses'

import {
  UseGetReviewStructureForSectionProps,
  User,
  FullStructure,
  SectionState,
  PageElement,
} from '../../types'

const getSectionIds = ({
  fullApplicationStructure,
  filteredSectionIds,
}: UseGetReviewStructureForSectionProps) =>
  filteredSectionIds ||
  Object.values(fullApplicationStructure.sections).map((section) => section.details.id) ||
  []

interface CompileVariablesForReviewResponseQueryProps extends UseGetReviewStructureForSectionProps {
  currentUser?: User | null
  sectionIds: number[]
}

type GenerateReviewStructure = (
  props: CompileVariablesForReviewResponseQueryProps & { data: GetReviewResponsesQuery }
) => FullStructure

// Since useGetReviewResponseQuery is used in both useGetReviewStructureForSection and useGetReviewStructureForSectionAsync, this helper aids in computing variables for the query
const compileVariablesForReviewResponseQuery = ({
  reviewAssignment,
  sectionIds,
  fullApplicationStructure,
  currentUser,
}: CompileVariablesForReviewResponseQueryProps) => ({
  reviewAssignmentId: reviewAssignment.id as number,
  sectionIds,
  userId: currentUser?.userId as number,
  previousLevel: reviewAssignment.level - 1,
  stageNumber: reviewAssignment.stage.number,
  applicationId: fullApplicationStructure.info.id,
})

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

  const { reviewQuestionAssignments, level, review } = reviewAssignment

  // This is usefull for linking assignments to elements
  newStructure = addElementsById(newStructure)
  newStructure = addSortedSectionsAndPages(newStructure)

  newStructure = addIsAssigned(newStructure, reviewQuestionAssignments)

  // Update fields element.isNewApplicantRsponse for applications re-submitted to a reviewer
  setIsNewApplicationResponse(newStructure)

  // thisReviewLatestResponse and thisReviewPreviousResponse
  // lowerLevelReviewLatestResponse and previousPreviousReviewLevelResponse
  // latestOriginalReviewResponse and previousOriginalReviewResponse
  newStructure = addAllReviewResponses(newStructure, data)

  // review info comes from reviewAssignment that's passed to this hook
  newStructure.thisReview = review

  // Update fields element.isNewReviewResponse for reviews re-submitted to a consolidator
  setIsNewReviewResponse(newStructure)

  // when changes requested by consolidator (included in thisReviewPreviousResponse OR thisReviewLatestResponse)
  addChangeRequestForReviewer(newStructure)

  newStructure = addIsPendingReview(newStructure, level)
  newStructure = addIsActiveReviewResponse(newStructure)

  // This needs to run before generateReveiwerProgress or generateConsolidatorProgress
  // since the reviews with isChangeRequest (and not changed) need to be removed from done accountings
  generateReviewerChangesRequestedProgress(newStructure)

  if (level === 1) {
    generateReviewerResponsesProgress(newStructure)
    generateReviewValidity(newStructure)
  } else {
    // This progress is NOT removing done from changes requested not changed yet!
    generateConsolidatorResponsesProgress(newStructure)
    generateConsolidationValidity(newStructure)
  }

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

const setIsNewReviewResponse = (structure: FullStructure) => {
  Object.values(structure.elementsById || {}).forEach((element) => {
    const {
      isAssigned,
      lowerLevelReviewLatestResponse,
      thisReviewPreviousResponse,
      thisReviewLatestResponse,
    } = element

    // Just update field in assigned elements
    if (isAssigned) {
      if (structure.thisReview?.status === ReviewStatus.Draft) {
        element.isNewReviewResponse =
          !!thisReviewPreviousResponse &&
          lowerLevelReviewLatestResponse?.timeUpdated > thisReviewPreviousResponse?.timeUpdated
      } else {
        element.isNewReviewResponse =
          lowerLevelReviewLatestResponse?.timeUpdated > thisReviewLatestResponse?.timeUpdated
      }
    }
  })
}

const getFilteredSections = (sectionIds: number[], sections: SectionState[]) => {
  return sections.filter((section) =>
    sectionIds.find((sectionId) => section.details.id === sectionId)
  )
}

const addIsPendingReview = (structure: FullStructure, reviewLevel: number) => {
  const isPendingReview =
    reviewLevel === 1
      ? (element: PageElement) =>
          !!element.response &&
          element.response?.id !== element?.thisReviewLatestResponse?.applicationResponseId
      : (element: PageElement) =>
          !!element?.lowerLevelReviewLatestResponse &&
          element.lowerLevelReviewLatestResponse?.id !==
            element?.thisReviewLatestResponse?.reviewResponseLinkId

  Object.values(structure.elementsById || {}).forEach((element) => {
    element.isPendingReview = isPendingReview(element)
  })
  return structure
}
// When consolidation is ongoing for one review, and change request was submitted for the other one, the only 'active' or 'editable' review response is the one not in change request (submitted)
const addIsActiveReviewResponse = (structure: FullStructure) => {
  Object.values(structure.elementsById || {}).forEach((element) => {
    element.isActiveReviewResponse =
      element?.thisReviewLatestResponse?.status === ReviewResponseStatus.Draft
  })
  return structure
}

const addAllReviewResponses = (structure: FullStructure, data: GetReviewResponsesQuery) => {
  // Following arrays have been sorted in useGetReviewResponsesQuery
  const thisReviewResponses = data?.thisReviewResponses?.nodes as ReviewResponse[]
  const lowerLevelReviewResponses = data?.previousLevelReviewResponses?.nodes as ReviewResponse[]
  const originalReviewResponses = data?.originalReviewResponses?.nodes as ReviewResponse[]

  // add thisReviewLatestResponse and thisReviewPreviousResponse
  // includes for a consolidation also has reviewResponsesByReviewResponseLinkId with Consolidator decision
  structure = addReviewResponses(
    structure,
    thisReviewResponses,
    (element, response) => (element.thisReviewLatestResponse = response),
    (element, response) => (element.thisReviewPreviousResponse = response)
  )

  // add lowerLevelReviewLatestResponse and previousPreviousReviewLevelResponse
  structure = addReviewResponses(
    structure,
    lowerLevelReviewResponses,
    (element, response) => (element.lowerLevelReviewLatestResponse = response),
    (element, response) => (element.lowerLevelReviewPreviousResponse = response)
  )
  // add latestOriginalReviewResponse and previousOriginalReviewResponse
  structure = addReviewResponses(
    structure,
    originalReviewResponses,
    (element, response) => (element.latestOriginalReviewResponse = response),
    (element, response) => (element.previousOriginalReviewResponse = response)
  )

  Object.entries(structure?.elementsById || {}).forEach(([id, element]) => {
    const elementThisReviewResponses = thisReviewResponses.filter(
      ({ templateElementId }) => templateElementId && String(templateElementId) === id
    )
    const elementLowerLevelReviewResponses = lowerLevelReviewResponses.filter(
      ({ templateElementId }) => templateElementId && String(templateElementId) === id
    )

    const hasThisReviewResponsesHistory =
      elementThisReviewResponses.length > 2 ||
      (element.thisReviewLatestResponse && element.thisReviewPreviousResponse
        ? element.thisReviewLatestResponse?.decision !==
          element.thisReviewPreviousResponse?.decision
        : false)

    const hasLowerLevelReviewResponsesHistory =
      elementLowerLevelReviewResponses.length > 2 ||
      (element.lowerLevelReviewLatestResponse && element.lowerLevelReviewPreviousResponse
        ? element.lowerLevelReviewLatestResponse?.decision !==
          element.lowerLevelReviewPreviousResponse?.decision
        : false)

    // Check if enableViewHistory already set to true (when there is more than 2 ApplicantResponseElements)
    // Or more than 2 thisReview or lowerLevelReview (that aren't duplications)
    element.enableViewHistory =
      element.enableViewHistory ||
      hasLowerLevelReviewResponsesHistory ||
      hasThisReviewResponsesHistory
  })

  return structure
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
    assignedElement.reviewQuestionAssignmentId = id
  })
  return newStructure
}

export { generateReviewStructure, getSectionIds, compileVariablesForReviewResponseQuery }
