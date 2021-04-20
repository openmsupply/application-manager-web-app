import { FullStructure, SectionState, Page } from '../../types'

const generateApplicantChangesRequestedProgress = (newStructure: FullStructure) => {
  newStructure?.sortedPages?.forEach(generatePageChangeRequestProgress)
  newStructure?.sortedSections?.forEach(generateSectionReviewProgress)

  addIsChangeRequest(newStructure)
}

const generateSectionReviewProgress = (section: SectionState) => {
  section.changeRequestsProgress = getSums(Object.values(section.pages))
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

// Simple helper that will iterate over elements and sum up all of the values for keys
// returning an object of keys with sums
const getSums = (elements: Page[]) => {
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

export default generateApplicantChangesRequestedProgress
