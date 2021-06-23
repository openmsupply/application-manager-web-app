import { useEffect } from 'react'
import { useRouter } from './useRouter'

const joinOrNone = (stringArray: string[]) =>
  stringArray.length === 0 ? 'none' : stringArray.join(',')

// used to active or diactive section in accordion with query parameters
// ?activeSections=none means no sections are active
// ?activeSections=s1 one section code s1 is active
// ?activeSections=s1,s2 two sections active s1 and s2
// defaultActiveSectionCodes is an array of section codes to set active by default that's if ?activeSection is undefined, can be empty

// returns two methods
type ToggleSection = (sectionCode: string) => () => void
type IsSectionActive = (sectionCode: string) => boolean

const useQuerySectionActivation = ({
  defaultActiveSectionCodes,
}: {
  defaultActiveSectionCodes: string[]
}) => {
  const {
    query: { activeSections },
    updateQuery,
  } = useRouter()

  useEffect(() => {
    if (!activeSections) {
      updateQuery({ activeSections: joinOrNone(defaultActiveSectionCodes) })
    }
  }, [activeSections])

  let currentActiveSections: string[] = []
  try {
    if (activeSections !== 'none') currentActiveSections = activeSections.split(',')
  } catch (e) {
    currentActiveSections = []
  }

  const toggleSection: ToggleSection = (sectionCode) => () => {
    if (currentActiveSections.length === 0) {
      updateQuery({ activeSections: sectionCode })
      return
    }

    if (currentActiveSections.find((code) => sectionCode === code))
      currentActiveSections = currentActiveSections.filter((code) => sectionCode !== code)
    else currentActiveSections.push(sectionCode)

    updateQuery({ activeSections: joinOrNone(currentActiveSections.sort()) })
  }

  const isSectionActive: IsSectionActive = (sectionCode) =>
    !!currentActiveSections.find((code) => sectionCode === code)

  return { toggleSection, isSectionActive }
}

export default useQuerySectionActivation
