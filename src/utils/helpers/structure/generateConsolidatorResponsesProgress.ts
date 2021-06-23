import { ReviewResponseDecision } from '../../generated/graphql'
import { FullStructure, SectionState, Page, PageElement, ConsolidationProgress } from '../../types'

const generateConsolidatorResponsesProgress = (newStructure: FullStructure) => {
  newStructure?.sortedPages?.forEach(generatePageConsolidationProgress)
  newStructure?.sortedSections?.forEach(generateSectionConsolidationProgress)
}

const generateSectionConsolidationProgress = (section: SectionState) => {
  section.consolidationProgress = getConsolidationProgress(Object.values(section.pages))
}

const conformOriginal = (element: PageElement) =>
  element.latestOriginalReviewResponse?.decision === ReviewResponseDecision.Approve
const nonConformOriginal = (element: PageElement) =>
  element.latestOriginalReviewResponse?.decision === ReviewResponseDecision.Decline
const agreeThisReview = (element: PageElement) =>
  element.thisReviewLatestResponse?.decision === ReviewResponseDecision.Agree
const disagreeThiReview = (element: PageElement) =>
  element.thisReviewLatestResponse?.decision === ReviewResponseDecision.Disagree
const activeThisReview = (element: PageElement) => element.isActiveReviewResponse
const reviewLowerLevelUpdates = (element: PageElement) => element.isNewReviewResponse
const reviewedLowerLevelUpdates = (element: PageElement) =>
  element.thisReviewLatestResponse?.decision

const generatePageConsolidationProgress = (page: Page) => {
  const totalReviewable = page.state.filter(
    ({ isAssigned, element }) => isAssigned && element.isVisible
  )

  const totalActive = totalReviewable.filter(activeThisReview)
  const totalNewReviewable = totalReviewable.filter(reviewLowerLevelUpdates)

  // totalConform of originalReviewResponse
  const totalConform = totalReviewable.filter(conformOriginal)
  // totalNonConform of originalReviewResponse
  const totalNonConform = totalReviewable.filter(nonConformOriginal)
  // reviews pending - used before starting a new review (also need to check isAssigned)
  const totalPendingReview = totalReviewable.filter(({ isPendingReview }) => isPendingReview)

  const totalAgree = totalReviewable.filter(agreeThisReview)

  const doneDisagree = totalReviewable.filter(disagreeThiReview)
  const doneAgreeConform = totalAgree.filter(conformOriginal)
  const doneAgreeNonConform = totalAgree.filter(nonConformOriginal)

  const doneActiveDisagree = doneDisagree.filter(activeThisReview)
  const doneActiveAgreeConform = doneAgreeConform.filter(activeThisReview)
  const doneActiveAgreeNonConform = doneAgreeNonConform.filter(activeThisReview)

  const doneNewReviewable = totalNewReviewable.filter(reviewedLowerLevelUpdates)

  page.consolidationProgress = {
    doneAgreeConform: doneAgreeConform.length,
    doneAgreeNonConform: doneAgreeNonConform.length,
    doneDisagree: doneDisagree.length,
    doneActiveDisagree: doneActiveDisagree.length,
    doneActiveAgreeConform: doneActiveAgreeConform.length,
    doneActiveAgreeNonConform: doneActiveAgreeNonConform.length,
    doneNewReviewable: doneNewReviewable.length,
    totalConform: totalConform.length,
    totalNonConform: totalNonConform.length,
    // BaseReviewProgress
    totalReviewable: totalReviewable.length,
    totalPendingReview: totalPendingReview.length,
    totalActive: totalActive.length,
    totalNewReviewable: totalNewReviewable.length,
  }
}

// Simple helper that will iterate over elements and sum up all of the values for keys
// returning an object of keys with sums
export const getConsolidationProgress = (elements: (Page | SectionState)[]) => {
  const initial: ConsolidationProgress = {
    doneAgreeConform: 0,
    doneAgreeNonConform: 0,
    doneDisagree: 0,
    doneActiveDisagree: 0,
    doneActiveAgreeConform: 0,
    doneActiveAgreeNonConform: 0,
    doneNewReviewable: 0,
    totalConform: 0,
    totalNonConform: 0,
    // BaseReviewProgress
    totalActive: 0,
    totalReviewable: 0,
    totalPendingReview: 0,
    totalNewReviewable: 0,
  }

  return elements.reduce((sum, page) => {
    const {
      doneAgreeConform,
      doneAgreeNonConform,
      doneDisagree,
      doneActiveDisagree,
      doneActiveAgreeConform,
      doneActiveAgreeNonConform,
      doneNewReviewable,
      totalConform,
      totalNonConform,
      totalActive,
      totalReviewable,
      totalPendingReview,
      totalNewReviewable,
    } = page.consolidationProgress || initial
    return {
      doneAgreeConform: sum.doneAgreeConform + doneAgreeConform,
      doneAgreeNonConform: sum.doneAgreeNonConform + doneAgreeNonConform,
      doneDisagree: sum.doneDisagree + doneDisagree,
      doneActiveDisagree: sum.doneActiveDisagree + doneActiveDisagree,
      doneActiveAgreeConform: sum.doneActiveAgreeConform + doneActiveAgreeConform,
      doneActiveAgreeNonConform: sum.doneActiveAgreeNonConform + doneActiveAgreeNonConform,
      doneNewReviewable: sum.doneNewReviewable + doneNewReviewable,
      totalConform: sum.totalConform + totalConform,
      totalNonConform: sum.totalNonConform + totalNonConform,
      // BaseReviewProgress
      totalActive: sum.totalActive + totalActive,
      totalReviewable: sum.totalReviewable + totalReviewable,
      totalPendingReview: sum.totalPendingReview + totalPendingReview,
      totalNewReviewable: sum.totalNewReviewable + totalNewReviewable,
    }
  }, initial)
}

export default generateConsolidatorResponsesProgress
