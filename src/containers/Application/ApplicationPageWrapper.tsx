import React, { useEffect, useState } from 'react'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading, ProgressBar, ModalWarning, NoMatch, ApplicationStart } from '../../components'
import {
  Button,
  ButtonProps,
  Grid,
  Header,
  Message,
  MessageProps,
  ModalProps,
  Segment,
  Sticky,
} from 'semantic-ui-react'
import { ApplicationStatus, useUpdateResponseMutation } from '../../utils/generated/graphql'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useUserState } from '../../contexts/UserState'
import { ElementsBox, NavigationBox } from './'
import {
  getCombinedStatus,
  getPageElementsStatuses,
  PROGRESS_STATUS,
} from '../../utils/helpers/validation/validatePage'
import strings from '../../utils/constants'
import messages from '../../utils/messages'
import {
  CurrentPage,
  Page,
  ResumeSection,
  SectionsStructure,
  StageAndStatus,
  User,
} from '../../utils/types'
import useLoadSectionsStructure from '../../utils/hooks/useLoadSectionsStructure'
import useRevalidateApplication from '../../utils/hooks/useRevalidateApplication'
import { getPageElementsInStructure } from '../../utils/helpers/structure/getElementsInStructure'
import { checkSectionsProgress } from '../../utils/helpers/structure/checkSectionsProgress'

// TODO: Remove this

const ApplicationPageWrapper: React.FC = () => {
  const [isRevalidated, setIsRevalidated] = useState(false)
  const [pageElements, setPageElements] = useState<Page>()
  const [showModal, setShowModal] = useState<ModalProps>({ open: false })
  const [loadStart, setLoadStart] = useState(false)
  const [summaryButtonClicked, setSummaryButtonClicked] = useState(false)
  const [sections, setSections] = useState<SectionsStructure>()

  const { query, push, replace } = useRouter()
  const { serialNumber, sectionCode, page } = query

  const {
    applicationState: {
      inputElementsActivity: { areTimestampsInSequence },
    },
    setApplicationState,
  } = useApplicationState()

  const {
    userState: { currentUser },
  } = useUserState()

  const {
    error,
    template,
    application,
    allResponses,
    sectionsStructure,
    currentSection,
    isApplicationReady,
  } = useLoadSectionsStructure({
    serialNumber: serialNumber as string,
    currentUser: currentUser as User,
    sectionCode,
    networkFetch: true,
    setApplicationState,
  })

  const { validatedSections, isProcessing } = useRevalidateApplication({
    serialNumber: serialNumber as string,
    currentUser: currentUser as User,
    sectionsStructure: sectionsStructure as SectionsStructure,
    isApplicationReady,
    isRevalidated,
    setIsRevalidated,
  })

  const [responseMutation] = useUpdateResponseMutation()

  // Flag to run validation over application after changes to sections structure
  useEffect(() => {
    if (sectionsStructure) {
      setIsRevalidated(false)
    }
  }, [sectionsStructure])

  // Wait for application to be loaded to:
  // 1 - ProcessRedirect: Will redirect to summary in case application is SUBMITTED
  // 2 - Set hook to load sections progress in the start page (if startMessage existing), OR
  // 3 - Set the current section state of the application
  useEffect(() => {
    if (!isApplicationReady || !validatedSections) return
    const { sectionsWithProgress } = validatedSections
    setSections(sectionsWithProgress)

    const { status } = application?.current as StageAndStatus
    if (status !== ApplicationStatus.Draft && status !== ApplicationStatus.ChangesRequired) {
      replace(`/application/${serialNumber}/summary`)
    } else if (!sectionCode || !page) {
      if (template?.startMessage) setLoadStart(true)
      // Redirects to first section/page if not Start Message defined
      else replace(`/application/${serialNumber}/${currentSection?.code}/Page1`)
    }
  }, [sectionCode, page, isApplicationReady, validatedSections])

  // Wait for loading (and validation of all responses) or
  // changes of section/page to rebuild the progress bar
  useEffect(() => {
    if (!sections || !sectionCode || !page) return
    const elements = getPageElementsInStructure({
      sectionsStructure: sections,
      sectionCode,
      page: Number(page),
    })
    setPageElements(elements)
  }, [sections, sectionCode, page])

  // Make sure all responses are up-to-date (areTimestampsInSequence)
  // and only proceed when button is clicked AND responses are ready
  useEffect(() => {
    if (areTimestampsInSequence && summaryButtonClicked) {
      setIsRevalidated(false)
    }
  }, [areTimestampsInSequence, summaryButtonClicked])

  // Run after Summary button is clicked -> will wait for evaluation hook to run
  // and redict to summary page if all questions are valid or show modal
  useEffect(() => {
    if (!summaryButtonClicked || !validatedSections) return
    setSummaryButtonClicked(false)
    const { sectionsWithProgress, elementsToUpdate } = validatedSections
    const { isCompleted, firstIncompleteLocation } = checkSectionsProgress(sectionsWithProgress)
    if (isCompleted) {
      push(`/application/${serialNumber}/summary`)
    } else {
      elementsToUpdate.forEach((updateElement) =>
        responseMutation({ variables: { ...updateElement } })
      )
      if (firstIncompleteLocation) {
        const code = firstIncompleteLocation
        const { progress } = sectionsWithProgress[code]
        push(`/application/${serialNumber}/${code}/Page${progress?.linkedPage || 1}`)
      }
      openModal(messages.SUBMISSION_FAIL)
    }
  }, [summaryButtonClicked, validatedSections, isRevalidated])

  const openModal = ({ title, message, option }: MessageProps) => {
    setShowModal({
      open: true,
      title,
      message,
      option,
      onClick: (event: any, data: ButtonProps) => setShowModal({ open: false }),
      onClose: () => setShowModal({ open: false }),
    })
  }

  const handleResumeClick = ({ sectionCode, page }: ResumeSection) => {
    setLoadStart(false)
    replace(`/application/${serialNumber}/${sectionCode}/Page${page}`)
  }

  const handleValidatePage = ({ section, page: currentPage }: CurrentPage) => {
    const foundSection = sections && sections[section.code]
    if (!foundSection) {
      console.log('Problem during validation', section)
      return false
    }
    const foundPage = Object.values(foundSection.pages).find(({ number }) => number === currentPage)
    if (!foundPage) {
      console.log('Problem during validation', currentPage)
      return false
    }
    const pageStatuses = getPageElementsStatuses(foundPage.state)

    return application?.isLinear
      ? getCombinedStatus(Object.values(pageStatuses)) === PROGRESS_STATUS.VALID
      : true
  }

  const getSectionDetails = () =>
    Object.values(sections as SectionsStructure).map(({ details: section }) => section)

  return error ? (
    <NoMatch />
  ) : !isApplicationReady || isProcessing || !sections ? (
    <Loading />
  ) : sections && loadStart && template ? (
    <ApplicationStart
      template={template}
      sections={sections}
      resumeApplication={handleResumeClick}
      setSummaryButtonClicked={() => setSummaryButtonClicked(true)}
    />
  ) : application && pageElements && allResponses && serialNumber && currentSection ? (
    <Segment.Group style={{ backgroundColor: 'Gainsboro', display: 'flex' }}>
      <ModalWarning showModal={showModal} />
      <Header textAlign="center">
        {currentUser?.organisation?.orgName || strings.TITLE_NO_ORGANISATION}
      </Header>
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
          <ProgressBar
            serialNumber={serialNumber as string}
            current={{ section: currentSection, page: Number(page) }}
            isLinear={application.isLinear}
            sections={sections}
            validateElementsInPage={handleValidatePage}
          />
        </Grid.Column>
        <Grid.Column width={10} stretched>
          <Segment basic>
            <ElementsBox
              sectionTitle={currentSection.title}
              responsesByCode={allResponses}
              page={pageElements}
              forceValidation={true} // TODO: Check if still needed
            />
            <NavigationBox
              sections={getSectionDetails()}
              currentSection={currentSection}
              serialNumber={serialNumber}
              currentPage={Number(page as string)}
              validateElementsInPage={handleValidatePage}
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
    <Message error header={strings.ERROR_APPLICATION_SECTION} />
  )
}

export default ApplicationPageWrapper
