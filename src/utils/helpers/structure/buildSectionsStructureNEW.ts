import { ElementBaseNEW, SectionDetails, SectionsStructureNEW } from '../../types'
interface BuildSectionsStructureProps {
  sections: SectionDetails[]
  baseElements: ElementBaseNEW[]
}

/**
 * @function buildSectionsStructure
 * Create the sections structure object to be used
 * in displaying each sections and its pages on either
 * an application or review pages. The structure is
 * defined by the SectionStructure type.
 * @param sections Array with all sections details
 * @param baseElements Array with all elements in application
 * @returns Object of complete sections structure
 */
export const buildSectionsStructure = ({
  sections,
  baseElements,
}: BuildSectionsStructureProps): SectionsStructureNEW => {
  // Create the sections and pages structure to display each section's element
  // Will also add the responses for each element, and can add reviews if received by props
  return sections.reduce((sectionsStructure: SectionsStructureNEW, section) => {
    const pageNumbers = Array.from(Array(section.totalPages).keys(), (n) => n + 1)
    const pages = pageNumbers.reduce((pages, pageNumber) => {
      const elements = getPageElements({
        baseElements,
        sectionIndex: section.index,
        pageNumber,
      })
      if (elements.length === 0) return pages

      // Will build the array of elements
      const state = elements.map((element) => ({ element }))

      const pageName = `Page ${pageNumber}`
      return {
        ...pages,
        [pageNumber]: { name: pageName, number: pageNumber, state, sectionCode: section.code },
      }
    }, {})

    return {
      ...sectionsStructure,
      [section.code]: {
        details: section,
        pages,
      },
    }
  }, {})
}

interface GetPageElementsProps {
  baseElements: ElementBaseNEW[]
  sectionIndex: number
  pageNumber: number
}

const getPageElements = ({ baseElements, sectionIndex, pageNumber }: GetPageElementsProps) => {
  const result = baseElements
    // .filter(({ isVisible }) => isVisible)
    .filter((element) => sectionIndex === element.sectionIndex && pageNumber === element.page)
    .sort((a, b) => a.elementIndex - b.elementIndex)

  return result
}
