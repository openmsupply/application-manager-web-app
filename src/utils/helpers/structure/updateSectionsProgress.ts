import {
  ApplicationElementStates,
  ResponsesByCode,
  RevalidateResult,
  SectionsStructure,
  User,
  ValidityFailure,
} from '../../types'
import { revalidateAll } from '../validation/revalidateAll'

interface GetSectionsProgressProps {
  currentUser: User
  elementsState: ApplicationElementStates
  responsesByCode: ResponsesByCode
  sections: SectionsStructure
  setSections: (props: {
    sectionsWithProgress: SectionsStructure
    elementsToUpdate: ValidityFailure[]
  }) => void
}

/**
 * @function updateSectionsProgress
 * Update sections structure and add the progress on each section.
 * After the sections structure is built (by useLoadSectionsStructure)
 * this utility function runs revalidateAll and retrieve each section
 * progress to be displayed in the UI for an application.
 * @param currentUser applicant user used to run validation
 * @param elementsState object with all elements in application
 * @param responsesByCode object with each response by element code
 * @param sectionsStructure Complete structure of sections
 * @param setSections Function to set new state of sections' structure
 * and array of elements to be updated if any validation failed
 */
const updateSectionsProgress = async ({
  currentUser,
  elementsState,
  responsesByCode,
  sections,
  setSections,
}: GetSectionsProgressProps) => {
  const validatePromises: Promise<RevalidateResult>[] = []
  Object.keys(sections).forEach((code) => {
    const validate = revalidateAll({
      elementsState,
      responsesByCode,
      currentUser,
      sectionCode: code,
    })
    validatePromises.push(validate)
  })

  Promise.all(validatePromises).then((values) => {
    const elementsToUpdate: ValidityFailure[] = []
    values.forEach(({ validityFailures, sectionCode, progress }) => {
      if (sectionCode) sections[sectionCode].progress = progress
      else console.log('Problem adding progress to section', sectionCode)
      validityFailures.forEach((changedElement) => elementsToUpdate.push(changedElement))
    })
    setSections({
      sectionsWithProgress: sections,
      elementsToUpdate,
    })
  })
}

export default updateSectionsProgress
