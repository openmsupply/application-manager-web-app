import { useEffect, useState } from 'react'
import { buildSectionsStructure } from '../helpers/structure/buildSectionsStructure'
import { SectionDetails, SectionsStructure, UseGetApplicationProps } from '../types'
import useGetResponsesAndElementState from './useGetResponsesAndElementState'
import useLoadApplication from './useLoadApplication'

const useLoadSectionsStructure = ({
  serialNumber,
  currentUser,
  sectionCode,
  networkFetch,
  setApplicationState,
  page,
}: UseGetApplicationProps) => {
  const [sectionsStructure, setSectionsStructure] = useState<SectionsStructure>()
  const [currentSection, setCurrentSection] = useState<SectionDetails>()

  const {
    error: applicationError,
    loading: applicationLoading,
    application,
    template,
    sections,
    isApplicationReady,
  } = useLoadApplication({
    serialNumber,
    currentUser,
    networkFetch,
  })

  const {
    error: responsesError,
    loading: responsesLoading,
    responsesByCode,
    elementsState,
  } = useGetResponsesAndElementState({
    serialNumber,
    currentUser,
    isApplicationReady,
  })

  // Buld SectionStructure to display each section (Application/Review)
  // separated by pages with elements, responses, review and progress
  useEffect(() => {
    if (!responsesLoading && elementsState && responsesByCode) {
      const sectionsStructure = buildSectionsStructure({
        sections,
        elementsState,
        responsesByCode,
      })
      setSectionsStructure(sectionsStructure)
    }
  }, [elementsState, responsesLoading])

  // After building the structure set the current section/page
  useEffect(() => {
    if (!sectionsStructure) return
    const foundSection = sections.find(({ code }) => code === sectionCode)
    if (foundSection) setCurrentSection(foundSection)
    else {
      const firstSection = sectionsStructure[Object.keys(sectionsStructure)[0]]
      setCurrentSection(firstSection.details)
    }
  }, [sectionsStructure, sectionCode, page])

  // Update timestamp to keep track of when elements have been properly updated
  // after losing focus.
  useEffect(() => {
    if (setApplicationState)
      setApplicationState({
        type: 'setElementTimestamp',
        timestampType: 'elementsStateUpdatedTimestamp',
      })
  }, [elementsState])

  return {
    error: applicationError || responsesError,
    loading: applicationLoading || responsesLoading,
    template,
    application,
    allResponses: responsesByCode,
    sectionsStructure,
    currentSection,
    isApplicationReady,
  }
}

export default useLoadSectionsStructure
