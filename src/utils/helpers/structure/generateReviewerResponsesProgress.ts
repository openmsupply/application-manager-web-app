import { ReviewResponseDecision } from '../../generated/graphql'

import { FullStructure, SectionState, Page, ReviewProgress } from '../../types'

const generateReviewerResponsesProgress = (newStructure: FullStructure) => {
  newStructure?.sortedPages?.forEach(generatePageReviewProgress)
  newStructure?.sortedSections?.forEach(generateSectionReviewProgress)
}

const generateSectionReviewProgress = (section: SectionState) => {
  section.reviewProgress = getReviewProgress(Object.values(section.pages))
}

const generatePageReviewProgress = (page: Page) => {
  const totalReviewable = page.state.filter(
    (element) =>
      element.isAssigned && element?.element.isVisible && element?.latestApplicationResponse?.id
  )

  // Only consider review responses that are linked to latest application response
  // or if part of changes requested if they have already been changed
  const totalReviewableLinkedToLatestApplicationResponse = totalReviewable.filter(
    ({ isPendingReview, isChangeRequest, isChanged }) =>
      !isPendingReview && (!isChangeRequest || isChanged)
  )

  const doneConform = totalReviewableLinkedToLatestApplicationResponse.filter(
    (element) => element.thisReviewLatestResponse?.decision === ReviewResponseDecision.Approve
  )
  const doneNonConform = totalReviewableLinkedToLatestApplicationResponse.filter(
    (element) => element.thisReviewLatestResponse?.decision === ReviewResponseDecision.Decline
  )
  const totalNewReviewable = totalReviewable.filter((element) => element.isNewApplicationResponse)
  const doneNewReviewable = totalNewReviewable.filter(
    (element) => !element.isPendingReview && element.thisReviewLatestResponse?.decision
  )

  const totalPendingReview = totalReviewable.filter(({ isPendingReview }) => isPendingReview)

  page.reviewProgress = {
    doneConform: doneConform.length,
    doneNonConform: doneNonConform.length,
    doneNewReviewable: doneNewReviewable.length,
    // BaseReviewProgress
    totalReviewable: totalReviewable.length,
    totalActive: totalReviewable.length,
    totalPendingReview: totalPendingReview.length,
    totalNewReviewable: totalNewReviewable.length,
  }
}

/**
 * @function: getReviewProgressSums
 * Helper to iterate over progress and return sums of progress keys
 * @param elements Pages or Sections
 * @returns ReviewProgress of return sum of progresses
 */
export const getReviewProgress = (elements: (Page | SectionState)[]) => {
  const initial: ReviewProgress = {
    doneConform: 0,
    doneNonConform: 0,
    doneNewReviewable: 0,
    // BaseReviewProgress
    totalActive: 0,
    totalReviewable: 0,
    totalPendingReview: 0,
    totalNewReviewable: 0,
  }

  return elements.reduce((sum, page) => {
    const {
      doneConform,
      doneNonConform,
      totalNewReviewable,
      doneNewReviewable,
      totalActive,
      totalReviewable,
      totalPendingReview,
    } = page.reviewProgress || initial
    return {
      doneConform: sum.doneConform + doneConform,
      doneNonConform: sum.doneNonConform + doneNonConform,
      doneNewReviewable: sum.doneNewReviewable + doneNewReviewable,
      // BaseReviewProgress
      totalActive: sum.totalActive + totalActive,
      totalReviewable: sum.totalReviewable + totalReviewable,
      totalPendingReview: sum.totalPendingReview + totalPendingReview,
      totalNewReviewable: sum.totalNewReviewable + totalNewReviewable,
    }
  }, initial)
}

export default generateReviewerResponsesProgress
