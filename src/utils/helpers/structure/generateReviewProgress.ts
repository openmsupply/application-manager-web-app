import { ReviewResponseDecision } from '../../generated/graphql'

import { FullStructure, SectionStateNEW, PageNEW, SectionAndPage } from '../../types'

const generateReviewProgress = (newStructure: FullStructure) => {
  Object.values(newStructure.sections).forEach((section) => {
    Object.values(section.pages).forEach(generatePageReviewProgress)
    generateSectionReviewProgress(section)
  })

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
  const doneNoneConform = totalReviewable.filter(
    (element) => element.response?.reviewResponse?.decision === ReviewResponseDecision.Decline
  )

  page.reviewProgress = {
    totalReviewable: totalReviewable.length,
    doneConform: doneConform.length,
    doneNoneConform: doneNoneConform.length,
  }
}

const generateReviewValidity = (newStructure: FullStructure) => {
  // TODO would prefer sorted pages and sorted sections available in structure
  const pages = Object.values(newStructure.sections)
    .sort((s1, s2) => s1.details.index - s2.details.index)
    .map((section) => Object.values(section.pages))
    .flat()
    .sort((p1, p2) => p1.number - p2.number)

  const sums = getSums(pages)

  let firstIncompleteReviewPage: SectionAndPage = null

  if (sums.doneNoneConform === 0 && sums.totalReviewable > sums.doneConform) {
    const firstIncomplete = pages.find(
      (page) =>
        page.reviewProgress?.totalReviewable !==
        (page.reviewProgress?.doneConform || 0) + (page.reviewProgress?.doneNoneConform || 0)
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
      sums.doneNoneConform === 0 ? ReviewResponseDecision.Approve : ReviewResponseDecision.Decline
}
// Simple helper that will iterate over elements and sum up all of the values for keys
// returning an object of keys with sums
const getSums = (elements: PageNEW[]) => {
  const initial = {
    totalReviewable: 0,
    doneConform: 0,
    doneNoneConform: 0,
  }

  return elements.reduce(
    (sum, element) => ({
      totalReviewable: sum.totalReviewable + (element?.reviewProgress?.totalReviewable || 0),
      doneConform: sum.doneConform + (element?.reviewProgress?.doneConform || 0),
      doneNoneConform: sum.doneNoneConform + (element?.reviewProgress?.doneNoneConform || 0),
    }),
    initial
  )
}

export default generateReviewProgress
