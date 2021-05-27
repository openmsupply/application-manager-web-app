import { FullStructure, SectionState, Page } from '../../types'

const generateReviewerChangesRequestedProgress = (newStructure: FullStructure) => {
  newStructure?.sortedPages?.forEach(generatePageChangeRequestProgress)
  newStructure?.sortedSections?.forEach(generateSectionReviewProgress)
  addIsChangeRequest(newStructure)
}

const generateSectionReviewProgress = (section: SectionState) => {
  section.changeRequestsProgress = getChangeRequestsPropress(Object.values(section.pages))
}

const generatePageChangeRequestProgress = (page: Page) => {
  const totalChangeRequests = page.state.filter(
    ({ isChangeRequest, element: { isVisible } }) => isChangeRequest && isVisible
  )
  const doneChangeRequests = totalChangeRequests.filter((element) => element.isChanged)

  page.changeRequestsProgress = {
    totalChangeRequests: totalChangeRequests.length,
    doneChangeRequests: doneChangeRequests.length,
  }
}

const addIsChangeRequest = (newStructure: FullStructure) => {
  const isPageRequest = ({ changeRequestsProgress }: Page) =>
    changeRequestsProgress?.totalChangeRequests

  newStructure.info.isChangeRequest = !!newStructure?.sortedPages?.find(isPageRequest)
}

/**
 * @function: getChangeRequestsProgressSums
 * Helper to iterate over progress and return sums of change request progress keys
 * @param elements Pages or Sections
 * @returns ChangesRequestProgress of return sum of progresses
 */
export const getChangeRequestsPropress = (elements: (Page | SectionState)[]) => {
  const initial = {
    totalChangeRequests: 0,
    doneChangeRequests: 0,
  }

  return elements.reduce(
    (sum, { changeRequestsProgress }) => ({
      totalChangeRequests:
        sum.totalChangeRequests + (changeRequestsProgress?.totalChangeRequests || 0),
      doneChangeRequests:
        sum.doneChangeRequests + (changeRequestsProgress?.doneChangeRequests || 0),
    }),
    initial
  )
}

export default generateReviewerChangesRequestedProgress
