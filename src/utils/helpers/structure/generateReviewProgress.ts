import { ReviewResponseDecision } from '../../generated/graphql'

import { FullStructure, SectionStateNEW, PageNEW } from '../../types'

const generateReviewProgress = (newStructure: FullStructure) => {
  newStructure?.sortedPages?.forEach(generatePageReviewProgress)
  newStructure?.sortedSections?.forEach(generateSectionReviewProgress)

  generateReviewValidity(newStructure)
}

const generateSectionReviewProgress = (section: SectionStateNEW) => {
  section.reviewProgress = getSums(Object.values(section.pages))
}

const generatePageReviewProgress = (page: PageNEW) => {
  const totalReviewable = page.state.filter((element) => element.isAssigned)
  const doneConform = totalReviewable.filter(
    (element) => element.response?.reviewResponse?.decision === ReviewResponseDecision.Approve
  )
  const doneNonConform = totalReviewable.filter(
    (element) => element.response?.reviewResponse?.decision === ReviewResponseDecision.Decline
  )

  page.reviewProgress = {
    totalReviewable: totalReviewable.length,
    doneConform: doneConform.length,
    doneNonConform: doneNonConform.length,
  }
}

const generateReviewValidity = (newStructure: FullStructure) => {
  const sortedPages = newStructure?.sortedPages || []
  const sums = getSums(sortedPages)

  let firstIncompleteReviewPage

  if (sums.doneNonConform === 0 && sums.totalReviewable > sums.doneConform) {
    const firstIncomplete = sortedPages.find(
      ({ reviewProgress }) =>
        reviewProgress?.totalReviewable !==
        (reviewProgress?.doneConform || 0) + (reviewProgress?.doneNonConform || 0)
    )

    if (!firstIncomplete) return
    else
      firstIncompleteReviewPage = {
        sectionCode: firstIncomplete.sectionCode,
        pageNumber: firstIncomplete.number,
      }
  }

  newStructure.firstIncompleteReviewPage = firstIncompleteReviewPage
  if (firstIncompleteReviewPage) newStructure.canSubmitReviewAs === null
  else
    newStructure.canSubmitReviewAs =
      sums.doneNonConform === 0 ? ReviewResponseDecision.Approve : ReviewResponseDecision.Decline
}
// Simple helper that will iterate over elements and sum up all of the values for keys
// returning an object of keys with sums
const getSums = (elements: PageNEW[]) => {
  const initial = {
    totalReviewable: 0,
    doneConform: 0,
    doneNonConform: 0,
  }

  return elements.reduce(
    (sum, { reviewProgress }) => ({
      totalReviewable: sum.totalReviewable + (reviewProgress?.totalReviewable || 0),
      doneConform: sum.doneConform + (reviewProgress?.doneConform || 0),
      doneNonConform: sum.doneNonConform + (reviewProgress?.doneNonConform || 0),
    }),
    initial
  )
}

export default generateReviewProgress
