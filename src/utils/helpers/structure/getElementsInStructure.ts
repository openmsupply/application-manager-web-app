import { Page, ResponseFull, SectionsStructure } from '../../types'

interface GetElementsInStructureProps {
  sectionsStructure: SectionsStructure
  sectionCode: string
  page: number
}

/**
 * @function getPageElementsInStructure
 * Get array of objects with elements, responses and reviews from
 * the sections structure corresponding to the section and page received
 * ```
 * @param sectionsStructure Complete structure of sections
 * @param sectionCode Code of section to get array of elements
 * @param page Number of page to get array of elements
 */
export const getPageElementsInStructure = ({
  sectionsStructure,
  sectionCode,
  page,
}: GetElementsInStructureProps): Page | undefined => {
  return Object.values(sectionsStructure[sectionCode].pages).find(({ number }) => number == page)
}

/**
 * @function getResponsesInStructure
 * Get array of all responses from the sections strucutre
 * @param sectionsStructure Complete structure of sections
 */
export const getResponsesInStrucutre = (sectionsStructure: SectionsStructure) => {
  return Object.values(sectionsStructure).reduce((responses: ResponseFull[], { pages }) => {
    Object.values(pages).forEach(({ state }) => {
      responses.concat(
        state
          .filter(({ response }) => response != null)
          .map(({ response }) => response as ResponseFull)
      )
    })
    return responses
  }, [])
}
