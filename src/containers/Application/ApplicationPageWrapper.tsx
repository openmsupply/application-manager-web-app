import React, { useEffect, useState } from 'react'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading, ProgressBar, ModalWarning, NoMatch, ApplicationStart } from '../../components'
import {
  Button,
  ButtonProps,
  Grid,
  Header,
  Label,
  ModalProps,
  Segment,
  Sticky,
} from 'semantic-ui-react'
import { ApplicationStatus, useUpdateResponseMutation } from '../../utils/generated/graphql'
import useLoadApplication from '../../utils/hooks/useLoadApplication'
import useGetResponsesAndElementState from '../../utils/hooks/useGetResponsesAndElementState'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useUserState } from '../../contexts/UserState'
import { ElementsBox, NavigationBox } from './'
import validatePage, {
  getCombinedStatus,
  getPageElementsStatuses,
  PROGRESS_STATUS,
} from '../../utils/helpers/application/validatePage'
import getPageElements from '../../utils/helpers/application/getPageElements'
import { revalidateAll } from '../../utils/helpers/application/revalidateAll'
import strings from '../../utils/constants'
import messages from '../../utils/messages'
import {
  ApplicationElementStates,
  ApplicationStage,
  ElementState,
  ProgressInApplication,
  ProgressStatus,
  ResponsesByCode,
  ResumeSection,
  SectionDetails,
  User,
  ValidationMode,
} from '../../utils/types'
import { TemplateElementCategory } from '../../utils/generated/graphql'
import getPreviousPage from '../../utils/helpers/application/getPreviousPage'
import useGetSectionsProgress from '../../utils/hooks/useGetSectionProgress'

const ApplicationPageWrapper: React.FC = () => {
  const {
    applicationState: {
      inputElementsActivity: { areTimestampsInSequence },
    },
    setApplicationState,
  } = useApplicationState()
  const [currentSection, setCurrentSection] = useState<SectionDetails>()
  const [pageElements, setPageElements] = useState<ElementState[]>([])
  const [progressInApplication, setProgressInApplication] = useState<ProgressInApplication>()
  const [forceValidation, setForceValidation] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<ModalProps>({ open: false })
  const [loadStart, setLoadStart] = useState(false)
  const [summaryButtonClicked, setSummaryButtonClicked] = useState(false)
  const {
    userState: { currentUser },
  } = useUserState()
  const { query, push, replace } = useRouter()
  const { serialNumber, sectionCode, page } = query

  const {
    error,
    loading,
    application,
    template,
    sections,
    isApplicationReady,
  } = useLoadApplication({
    serialNumber: serialNumber as string,
    networkFetch: true,
  })

  const {
    error: responsesError,
    loading: responsesLoading,
    responsesByCode,
    elementsState,
  } = useGetResponsesAndElementState({
    serialNumber: serialNumber as string,
    isApplicationReady,
  })

  const { sectionsProgress, isLoadingProgress } = useGetSectionsProgress({
    currentUser,
    sections,
    elementsState,
    responsesByCode,
  })

  const [responseMutation] = useUpdateResponseMutation()

  // Wait for application to be loaded to:
  // 1 - ProcessRedirect: Will redirect to summary in case application is SUBMITTED
  // 2 - Set hook to load sections progress in the start page (if startMessage existing), OR
  // 3 - Set the current section state of the application
  useEffect(() => {
    if (elementsState && responsesByCode && isApplicationReady) {
      const stage = application?.stage
      const { status } = stage as ApplicationStage
      if (status !== ApplicationStatus.Draft && status !== ApplicationStatus.ChangesRequired) {
        replace(`/application/${serialNumber}/summary`)
      } else if (!sectionCode || !page) {
        if (template?.startMessage) setLoadStart(true)
        else {
          // Redirects to first section/page if not Start Message defined
          const firstSection = sections[0].code
          replace(`/application/${serialNumber}/${firstSection}/Page1`)
        }
      } else setCurrentSection(sections.find(({ code }) => code === sectionCode))
    }
  }, [elementsState, responsesByCode, sectionCode, page, isApplicationReady])

  // Update timestamp to keep track of when elements have been properly updated
  // after losing focus.
  useEffect(() => {
    setApplicationState({
      type: 'setElementTimestamp',
      timestampType: 'elementsStateUpdatedTimestamp',
    })
  }, [elementsState])

  // Wait for loading (and evaluating elements and responses)
  // or a change of section/page to rebuild the progress bar
  useEffect(() => {
    if (responsesLoading || !elementsState || !currentSection) return

    const progressStructure = buildProgressInApplication({
      elementsState,
      responses: responsesByCode,
      sections: sections,
      isLinear: application?.isLinear as boolean,
      currentSection: currentSection.index,
      currentPage: Number(page),
    })
    setProgressInApplication(progressStructure)

    const elements = getPageElements({
      elementsState,
      sectionIndex: currentSection.index,
      pageNumber: Number(page),
    })

    setPageElements(elements)
  }, [responsesLoading, currentSection, page, elementsState])

  const defaultCurrentPage = {
    section: currentSection as SectionDetails,
    page: Number(page),
  }

  const validateElementsInPage = ({ section, page } = defaultCurrentPage): boolean => {
    const pageElementsStatuses = getPageElementsStatuses({
      elementsState: elementsState as ApplicationElementStates,
      responses: responsesByCode as ResponsesByCode,
      currentSectionIndex: section.index,
      page,
    })

    if (application?.isLinear && responsesByCode) {
      Object.entries(pageElementsStatuses).forEach(([code, status]) => {
        if (status === PROGRESS_STATUS.INCOMPLETE) {
          // Update responses text to re-validate the status (on the page)
          const response = responsesByCode[code]
          if (response) {
            setForceValidation(true)
            responseMutation({
              variables: {
                id: response.id,
                value: { text: '' },
                isValid: false,
              },
            })
          }
        }
      })
    }

    const statuses = Object.values(pageElementsStatuses)
    const validation = getCombinedStatus(statuses)

    // Run STRICT validation for linear and LOOSE for non-linear application
    return application?.isLinear ? validation === (PROGRESS_STATUS.VALID as ProgressStatus) : true
  }

  // Make sure all responses are up-to-date (areTimestampsInSequence)
  // and only proceed when button is clicked AND responses are ready
  useEffect(() => {
    if (areTimestampsInSequence && summaryButtonClicked) {
      handleSummaryClick()
    }
  }, [areTimestampsInSequence, summaryButtonClicked])

  const openModal = () => {
    setShowModal({
      open: true,
      ...messages.VALIDATION_FAIL,
      onClick: (event: any, data: ButtonProps) => setShowModal({ open: false }),
      onClose: () => setShowModal({ open: false }),
    })
  }

  const handleSummaryClick = async () => {
    setSummaryButtonClicked(false)
    const revalidate = await revalidateAll({
      elementsState: elementsState as ApplicationElementStates,
      responsesByCode: responsesByCode as ResponsesByCode,
      currentUser: currentUser as User,
    })

    // Update database if validity changed
    revalidate.validityFailures.forEach((changedElement) => {
      responseMutation({
        variables: {
          id: changedElement.id,
          isValid: changedElement.isValid,
        },
      })
    })

    if (!revalidate.allValid) openModal()
    else push(`/application/${serialNumber}/summary`)
  }

  const handleResumeClick = ({ sectionCode, page }: ResumeSection) => {
    setLoadStart(false)
    replace(`/application/${serialNumber}/${sectionCode}/Page${page}`)
  }

  return error || responsesError ? (
    <NoMatch />
  ) : loading || responsesLoading || (loadStart && isLoadingProgress) ? (
    <Loading />
  ) : loadStart && serialNumber && template && sectionsProgress ? (
    <ApplicationStart
      template={template}
      sections={sectionsProgress}
      resumeApplication={handleResumeClick}
      setSummaryButtonClicked={() => setSummaryButtonClicked(true)}
    />
  ) : application && sections && serialNumber && currentSection && responsesByCode ? (
    <Segment.Group style={{ backgroundColor: 'Gainsboro', display: 'flex' }}>
      <ModalWarning showModal={showModal} />
      <Header textAlign="center">{currentUser?.organisation?.orgName || ''}</Header>
      <Grid
        stackable
        style={{
          backgroundColor: 'white',
          padding: 10,
          margin: '0px 50px',
          minHeight: 500,
          flex: 1,
        }}
      >
        <Grid.Column width={4}>
          {!progressInApplication ? (
            <Loading />
          ) : (
            <ProgressBar
              serialNumber={serialNumber as string}
              progressStructure={progressInApplication}
              currentSectionPage={{ sectionIndex: currentSection.index, currentPage: Number(page) }}
              getPreviousPage={(props) => getPreviousPage({ sections: sections, ...props })}
              validateElementsInPage={validateElementsInPage}
            />
          )}
        </Grid.Column>
        <Grid.Column width={10} stretched>
          <Segment basic>
            <ElementsBox
              sectionTitle={currentSection.title}
              responsesByCode={responsesByCode}
              elements={pageElements}
              anyRequiredQuestions={getPageHasRequiredQuestions(pageElements)}
              forceValidation={forceValidation}
            />
            <NavigationBox
              sections={sections}
              currentSection={currentSection}
              serialNumber={serialNumber}
              currentPage={Number(page as string)}
              validateElementsInPage={validateElementsInPage}
              openModal={openModal}
            />
          </Segment>
        </Grid.Column>
        <Grid.Column width={2} />
      </Grid>
      <Sticky
        pushing
        style={{ backgroundColor: 'white', boxShadow: ' 0px -5px 8px 0px rgba(0,0,0,0.1)' }}
      >
        <Segment basic textAlign="right">
          <Button color="blue" onClick={() => setSummaryButtonClicked(true)}>
            {strings.BUTTON_SUMMARY}
          </Button>
        </Segment>
      </Sticky>
    </Segment.Group>
  ) : (
    <Label content={strings.ERROR_APPLICATION_SECTION} />
  )
}

const getPageHasRequiredQuestions = (elements: ElementState[]): boolean =>
  elements.some(
    ({ isRequired, isVisible, category }) =>
      category === TemplateElementCategory.Question && isRequired && isVisible
  )
interface buildProgressInApplicationProps {
  elementsState: ApplicationElementStates | undefined
  responses: ResponsesByCode | undefined
  sections: SectionDetails[]
  isLinear: boolean
  currentSection: number
  currentPage: number
  validationMode?: ValidationMode
}

function buildProgressInApplication({
  elementsState,
  responses,
  sections,
  isLinear,
  currentSection,
  currentPage,
  validationMode = 'LOOSE',
}: buildProgressInApplicationProps): ProgressInApplication {
  if (!elementsState || !responses) return []

  let previousSectionStatus: ProgressStatus = PROGRESS_STATUS.VALID
  let previousPageStatus: ProgressStatus = PROGRESS_STATUS.VALID

  const isCurrentPage = (page: number, sectionIndex: number) =>
    sectionIndex === currentSection && page === currentPage
  const isCurrentSection = (sectionIndex: number) => sectionIndex === currentSection

  const isPreviousPageValid = (pageNumber: number, sectionIndex: number): boolean => {
    if (pageNumber === 1 && sectionIndex === 0) return true // First page in first section can be navigated always
    const previousPage = pageNumber - 1
    const isPreviousActive =
      previousPage > 0
        ? isCurrentPage(previousPage, sectionIndex)
        : isCurrentSection(sectionIndex - 1)
    return isPreviousActive ? false : previousPageStatus === PROGRESS_STATUS.VALID
  }

  const getPageStatus = (sectionIndex: number, page: number, validationMode: ValidationMode) => {
    const draftPageStatus = validatePage({
      elementsState,
      responses,
      currentSectionIndex: sectionIndex,
      page,
    })
    if (validationMode === 'STRICT')
      return draftPageStatus === PROGRESS_STATUS.VALID
        ? PROGRESS_STATUS.VALID
        : PROGRESS_STATUS.NOT_VALID
    return draftPageStatus
  }

  const getPageValidationMode = (pageNumber: number, sectionIndex: number) =>
    isLinear && isPreviousPageValid(pageNumber, sectionIndex) ? 'STRICT' : 'LOOSE'

  return sections.map((section) => {
    // Create an array with all pages in each section
    const pageNumbers = Array.from(Array(section.totalPages).keys(), (n) => n + 1)

    const isPreviousSectionValid = previousSectionStatus === PROGRESS_STATUS.VALID
    previousPageStatus = previousSectionStatus

    // Run each page using strict validation mode for linear application with visited pages
    const pages = pageNumbers.map((pageNumber) => {
      const pageValidationMode = validationMode || getPageValidationMode(pageNumber, section.index)

      const status = getPageStatus(section.index, pageNumber, pageValidationMode)
      previousPageStatus = status // Update new previous page for next iteration

      return {
        pageNumber,
        canNavigate: isLinear ? isPreviousPageValid(pageNumber, section.index) : true,
        isActive: isCurrentPage(pageNumber, section.index),
        status,
      }
    })

    const progressInSection = {
      code: section.code,
      title: section.title,
      canNavigate: !isLinear || section.index <= currentSection || isPreviousSectionValid,
      isActive: section.index === currentSection,
      status: getCombinedStatus(pages.map(({ status }) => status)),
      pages,
    }

    previousSectionStatus = progressInSection.status

    return progressInSection
  })
}

export default ApplicationPageWrapper
