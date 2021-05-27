import { Decision } from '../../generated/graphql'
import { FullStructure, Page } from '../../types'
import { getChangeRequestsPropress } from './generateReviewerChangesRequestedProgress'
import { getReviewProgress } from './generateReviewerResponsesProgress'

const generateReviewValidity = (newStructure: FullStructure) => {
  const sortedPages = newStructure?.sortedPages || []
  const { doneConform, doneNonConform, totalReviewable } = getReviewProgress(
    Object.values(newStructure.sections)
  )
  const { doneChangeRequests, totalChangeRequests } = getChangeRequestsPropress(
    Object.values(newStructure.sections)
  )

  let firstIncompleteReviewPage

  const incompletedUpdatesToChangesRequest = totalChangeRequests > doneChangeRequests
  const incompletedReviews = doneNonConform === 0 && totalReviewable > doneConform
  const pageIsNotValid = ({ reviewProgress, changeRequestsProgress }: Page) => {
    const { doneChangeRequests = 0, totalChangeRequests = 0 } = changeRequestsProgress || {}
    // Not valid if remaining change requests
    if (doneChangeRequests !== totalChangeRequests) return true
    const { totalReviewable, doneConform } = reviewProgress || {}
    // Valid if all conform
    if (totalReviewable === doneConform) return false
    // Valid if at least one non conform
    if (doneNonConform > 0) return false
    // Otherwise invalid
    return true
  }

  if (incompletedUpdatesToChangesRequest || incompletedReviews) {
    const firstIncomplete = sortedPages.find(pageIsNotValid)

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
    newStructure.canSubmitReviewAs = doneNonConform === 0 ? Decision.Conform : Decision.NonConform
}

export default generateReviewValidity
