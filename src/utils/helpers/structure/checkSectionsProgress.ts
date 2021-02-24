import { SectionsStructure } from '../../types'

/**
 * @function checkSectionsProgress
 * Return if all sections in sections structure are completed
 * if any section is missing responses returns link to section & page
 * @param sectionsStructure - Complete structure of sections
 * @returns Object with isCompleted flag and firstIncompleted section
 */
export const checkSectionsProgress = (sectionsStructure: SectionsStructure) => {
  const isCompleted = Object.values(sectionsStructure).every(
    ({ progress }) => progress?.completed && progress.valid
  )

  if (isCompleted) return { isCompleted: true }

  return {
    isCompleted: false,
    firstIncompleteLocation: findFirstIncompleteSection(sectionsStructure),
  }
}

const findFirstIncompleteSection = (sectionsStructure: SectionsStructure) => {
  const firstIncompleteLocation = Object.entries(sectionsStructure)
    .filter(([_, section]) => section.progress)
    .sort(([aKey], [bKey]) => (aKey < bKey ? -1 : 1))
    .find(([_, section]) => !section.progress?.completed || !section.progress.valid)

  if (firstIncompleteLocation) {
    const [_, section] = firstIncompleteLocation
    return section.details.code
  }
}
