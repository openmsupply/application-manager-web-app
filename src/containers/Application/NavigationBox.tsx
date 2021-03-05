import React, { useState, useEffect } from 'react'
import { Container, Label, MessageProps } from 'semantic-ui-react'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useRouter } from '../../utils/hooks/useRouter'
import { CurrentPage, SectionDetails } from '../../utils/types'
import strings from '../../utils/constants'
import messages from '../../utils/messages'

// TODO: Remove this
interface NavigationBoxProps {
  sections: SectionDetails[]
  currentSection: SectionDetails
  serialNumber: string
  currentPage: number
  validateElementsInPage: (props: CurrentPage) => boolean
  openModal: ({ title, message, option }: MessageProps) => void
}

const NavigationBox: React.FC<NavigationBoxProps> = ({
  sections: templateSections,
  currentSection,
  serialNumber,
  currentPage,
  validateElementsInPage,
  openModal,
}) => {
  const {
    applicationState: {
      inputElementsActivity: { areTimestampsInSequence },
    },
  } = useApplicationState()
  const [nextButtonClicked, setNextButtonClicked] = useState(false)

  const nextSection = templateSections.find(({ index }) => index === currentSection.index + 1)
  const previousSection = templateSections.find(({ index }) => index === currentSection.index - 1)

  const isFirstPage = currentPage - 1 === 0 && !previousSection
  const isLastPage = currentPage + 1 > currentSection.totalPages && !nextSection

  const { push } = useRouter()
  const sendToPage = (section: string, page: number) => {
    push(`/application/${serialNumber}/${section}/Page${page}`)
  }

  const previousButtonHandler = (_: any) => {
    const previousPage = currentPage - 1
    if (previousPage === 0) {
      // Will check if previous page is in a other section
      previousSection
        ? sendToPage(previousSection.code, previousSection.totalPages)
        : console.log('Problem to load previous page (not found)!')
    } else sendToPage(currentSection.code, previousPage)
  }

  const nextPageButtonHandler = async () => {
    // Get the next page and section
    const nextPage = currentPage + 1
    const section = nextPage > currentSection.totalPages ? nextSection : currentSection
    setNextButtonClicked(false)
    if (!section) {
      console.log('Problem to load next page (not found)!')
      return
    }
    const page = nextPage > currentSection.totalPages ? 1 : nextPage

    // Check if previous page (related to next) is valid
    const status = validateElementsInPage({ section: currentSection, page: currentPage })

    if (!status) openModal(messages.VALIDATION_FAIL)
    else sendToPage(section.code, page)
  }

  // Make sure all responses are up-to-date (areTimestampsInSequence)
  // and only proceed when button is clicked AND responses are ready
  useEffect(() => {
    if (areTimestampsInSequence && nextButtonClicked) {
      nextPageButtonHandler()
    }
  }, [areTimestampsInSequence, nextButtonClicked])

  return (
    <Container>
      {!isFirstPage && (
        <Label basic as="a" onClick={previousButtonHandler}>
          {strings.BUTTON_PREVIOUS}
        </Label>
      )}
      {!isLastPage && (
        <Label basic as="a" onClick={() => setNextButtonClicked(true)}>
          {strings.BUTTON_NEXT}
        </Label>
      )}
    </Container>
  )
}

export default NavigationBox
