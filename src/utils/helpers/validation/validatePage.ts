import { TemplateElementCategory } from '../../generated/graphql'
import { PageElements, PageElementsStatuses, ProgressStatus, ResponseFull } from '../../types'

export enum PROGRESS_STATUS {
  NOT_VALID = 'NOT_VALID',
  VALID = 'VALID',
  INCOMPLETE = 'INCOMPLETE',
}
/**
 * @function validatePage
 * Run the validation of the application progress of page
 * Will use other utility methods in same file to get all page
 * current responses statuses and the combined progress status
 * @param pageState State of page in the structure
 * @returns Progress status of page
 */
export const validatePage = (pageState: PageElements) => {
  const pageStatuses = getPageElementsStatuses(pageState)
  const statuses = Object.values(pageStatuses)
  return getCombinedStatus(statuses)
}

/**
 * @function getCombinedStatus
 * Get progress status of all responses statuses received
 * @param pages Array of statuses of each response
 * @returns Progress status of page
 */
export const getCombinedStatus = (pages: ProgressStatus[] | undefined): ProgressStatus => {
  if (!pages) return PROGRESS_STATUS.VALID
  if (pages.some((status) => status === PROGRESS_STATUS.NOT_VALID)) return PROGRESS_STATUS.NOT_VALID
  if (pages.some((status) => status === PROGRESS_STATUS.INCOMPLETE))
    return PROGRESS_STATUS.INCOMPLETE
  return PROGRESS_STATUS.VALID
}

/**
 * @function getPageElementsStatuses
 * Deduce an array of responses statuses (to define page status)
 * filtering out all informative or invisible elemets from
 * the received page structure with all responses in this page.
 * @param pageState State of page in the structure
 */
export const getPageElementsStatuses = (pageState: PageElements) => {
  // Filter visible elements in the current page
  const visibleQuestions = pageState.filter(({ element: { isVisible, category } }) => {
    return isVisible && category === TemplateElementCategory.Question
  })
  // Generate array with current status of responses for each question to verify
  const pageResponsesStatuses = visibleQuestions.reduce(
    (responsesStatuses: PageElementsStatuses, { element: { code, isRequired }, response }) => {
      const { text, isValid } = response as ResponseFull
      const emptyResponse = !text || isValid === null
      if (isRequired && emptyResponse)
        return { ...responsesStatuses, [code]: PROGRESS_STATUS.INCOMPLETE }
      // If not required and empty response -> Should return as valid
      else if (emptyResponse) return { ...responsesStatuses, [code]: PROGRESS_STATUS.VALID }
      return {
        ...responsesStatuses,
        [code]: isValid ? PROGRESS_STATUS.VALID : PROGRESS_STATUS.NOT_VALID,
      }
    },
    {}
  )

  // Return object with all required/filled elements statuses
  return pageResponsesStatuses
}
