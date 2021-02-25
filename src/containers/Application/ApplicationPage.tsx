import React, { useEffect, useState } from 'react'
import {
  FullStructure,
  ResponsesByCode,
  ElementStateNEW,
  MethodToCallOnRevalidation,
  SectionAndPage,
} from '../../utils/types'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { useUserState } from '../../contexts/UserState'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading } from '../../components'
import strings from '../../utils/constants'
import { Button, Grid, Header, Message, Segment, Sticky } from 'semantic-ui-react'
import { PageElements } from '../../components/Application'
import { useFormElementUpdateTracker } from '../../contexts/FormElementUpdateTrackerState'

interface ApplicationProps {
  structure: FullStructure
  responses?: ResponsesByCode
}

const getFirstInvalidPage = (fullStructure: FullStructure): SectionAndPage | null => {
  // TODO implement, should rely on .progress
  // return { sectionCode: 'S1', pageName: 'Page 2' }
  return null
}

interface RevalidationState {
  methodToCallOnRevalidation: MethodToCallOnRevalidation | null
  shouldProcessValidation: boolean
  lastRevalidationRequest: number
}

const ApplicationPage: React.FC<ApplicationProps> = ({ structure }) => {
  const {
    userState: { currentUser },
  } = useUserState()
  const { push, query } = useRouter()

  const {
    state: { isLastElementUpdateProcessed, elementUpdatedTimestamp },
  } = useFormElementUpdateTracker()

  const [strictSectionPage, setStrictSectionPage] = useState<SectionAndPage | null>(null)
  const [revalidationState, setRevalidationState] = useState<RevalidationState>({
    methodToCallOnRevalidation: null,
    shouldProcessValidation: false,
    lastRevalidationRequest: Date.now(),
  })

  const shouldRevalidate = isLastElementUpdateProcessed && revalidationState.shouldProcessValidation
  const minRefetchTimestampForRevalidation = shouldRevalidate ? elementUpdatedTimestamp : 0

  const { error, fullStructure } = useGetFullApplicationStructure({
    structure,
    shouldRevalidate,
    minRefetchTimestampForRevalidation,
  })

  const currentSection = query.sectionCode
  const currentPage = `Page ${query.page}`

  /* Method to pass to progress bar, next button and submit button  to cause revalidation before aciton can be proceeded
     Should always be called on submit, but only be called on next or progress bar navigation when isLinear */
  // TODO may rename if we want to display loading modal ?
  const requestRevalidation = (methodToCall: MethodToCallOnRevalidation) => {
    setRevalidationState({
      methodToCallOnRevalidation: methodToCall,
      shouldProcessValidation: true,
      lastRevalidationRequest: Date.now(),
    })
    // TODO show loading modal ?
  }

  // Revalidation Effect
  useEffect(() => {
    if (
      fullStructure &&
      revalidationState.methodToCallOnRevalidation &&
      (fullStructure?.lastValidationTimestamp || 0) > revalidationState.lastRevalidationRequest
    ) {
      const firstInvalidPage = getFirstInvalidPage(fullStructure)
      console.log(fullStructure.sections.S1.pages['Page 1'].state[3])
      setRevalidationState({
        ...revalidationState,
        methodToCallOnRevalidation: null,
        shouldProcessValidation: false,
      })
      revalidationState.methodToCallOnRevalidation(firstInvalidPage, setStrictSectionPage)
      // TODO hide loading modal
    }
  }, [revalidationState, fullStructure])

  useEffect(() => {
    if (!structure) return

    // Re-direct based on application status and progress
    if (structure.info.current?.status === ApplicationStatus.ChangesRequired)
      push(`/applicationNEW/${structure.info.serial}`)
    if (structure.info.current?.status !== ApplicationStatus.Draft)
      push(`/applicationNEW/${structure.info.serial}/summary`)

    // TO-DO: Redirect based on Progress (wait till Progress calculation is done)
  }, [structure])

  if (error) return <Message error header={strings.ERROR_APPLICATION_PAGE} list={[error]} />
  if (!fullStructure || !fullStructure.responsesByCode) return <Loading />

  return (
    <Segment.Group style={{ backgroundColor: 'Gainsboro', display: 'flex' }}>
      {/* <ModalWarning showModal={showModal} /> */}
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
          <ProgressBar structure={fullStructure as FullStructure} />
        </Grid.Column>
        <Grid.Column width={10} stretched>
          <Segment basic>
            <Segment vertical style={{ marginBottom: 20 }}>
              <Header content={fullStructure.sections[currentSection].details.title} />
              <PageElements
                elements={getCurrentPageElements(fullStructure, currentSection, currentPage)}
                responsesByCode={fullStructure.responsesByCode}
                isStrictPage={
                  currentSection === strictSectionPage?.sectionCode &&
                  currentPage === strictSectionPage?.pageName
                }
                isEditable
              />
            </Segment>
            <NavigationBox />
          </Segment>
        </Grid.Column>
        <Grid.Column width={2} />
      </Grid>
      <Sticky
        pushing
        style={{ backgroundColor: 'white', boxShadow: ' 0px -5px 8px 0px rgba(0,0,0,0.1)' }}
      >
        <Segment basic textAlign="right">
          <Button
            color="blue"
            onClick={() => {
              requestRevalidation((sectionAndPage, setStrictSectionPage) => {
                setStrictSectionPage(null)
                console.log('revalidation finished', sectionAndPage)
              })
            }}
          >
            {/* TO-DO */}
            {strings.BUTTON_SUMMARY}
          </Button>
        </Segment>
      </Sticky>
    </Segment.Group>
  )
}

const ProgressBar: React.FC<ApplicationProps> = ({ structure }) => {
  // Placeholder -- to be replaced with new component
  return <p>Progress Bar here</p>
}

const NavigationBox: React.FC = () => {
  // Placeholder -- to be replaced with new component
  return <p>Navigation Buttons</p>
}

export default ApplicationPage

const getCurrentPageElements = (structure: FullStructure, section: string, page: string) => {
  return structure.sections[section].pages[page].state.map(
    (item) => item.element
  ) as ElementStateNEW[]
}
