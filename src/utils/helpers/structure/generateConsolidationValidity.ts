import { Decision } from '../../generated/graphql'
import { FullStructure } from '../../types'
import { getConsolidationProgress } from './generateConsolidatorResponsesProgress'

const generateConsolidationValidity = (newStructure: FullStructure) => {
  const sortedPages = newStructure?.sortedPages || []
  const { doneActiveDisagree, doneAgreeNonConform, doneActiveAgreeConform, totalReviewable } =
    getConsolidationProgress(Object.values(newStructure.sections))

  newStructure.firstIncompleteReviewPage = undefined

  if (doneActiveDisagree > 0) {
    newStructure.canSubmitReviewAs = Decision.ChangesRequested
    return
  }

  if (doneAgreeNonConform > 0) {
    newStructure.canSubmitReviewAs = Decision.NonConform
    return
  }

  if (totalReviewable === doneActiveAgreeConform) {
    newStructure.canSubmitReviewAs = Decision.Conform
    return
  }

  const firstIncomplete = sortedPages.find(
    ({ consolidationProgress }) =>
      consolidationProgress?.totalReviewable !==
      (consolidationProgress?.doneActiveAgreeConform || 0)
  )

  if (!firstIncomplete) return

  const firstIncompleteReviewPage = {
    sectionCode: firstIncomplete.sectionCode,
    pageNumber: firstIncomplete.number,
  }

  newStructure.firstIncompleteReviewPage = firstIncompleteReviewPage
  newStructure.canSubmitReviewAs === null
}

export default generateConsolidationValidity
