import React, { useEffect, useState } from 'react'
import {
  FullStructure,
  ResponsesByCode,
  ElementStateNEW,
  SectionAndPage,
  MethodRevalidate,
  MethodToCallProps,
} from '../../utils/types'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { useUserState } from '../../contexts/UserState'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading } from '../../components'
import strings from '../../utils/constants'
import { Grid, Header, Message, Segment } from 'semantic-ui-react'
import ProgressBarNEW from '../../components/Application/ProgressBarNEW'
import { PageElements } from '../../components/Application'
import { useFormElementUpdateTracker } from '../../contexts/FormElementUpdateTrackerState'
import checkPageIsAccessible from '../../utils/helpers/structure/checkPageIsAccessible'
import { Navigation } from '../../components'

interface ApplicationProps {
  structure: FullStructure
  responses?: ResponsesByCode
}

interface MethodToCall {
  (props: MethodToCallProps): void
}

interface RevalidationState {
  methodToCallOnRevalidation: MethodToCall | null
  shouldProcessValidation: boolean
  lastRevalidationRequest: number
}

const ApplicationPage: React.FC<ApplicationProps> = ({ structure }) => {
  const {
    userState: { currentUser },
  } = useUserState()
  const {
    query: { serialNumber, sectionCode, page },
    push,
  } = useRouter()

  const pageNumber = Number(page)

  const {
    state: { isLastElementUpdateProcessed, elementUpdatedTimestamp, wasElementChange },
  } = useFormElementUpdateTracker()

  const [strictSectionPage, setStrictSectionPage] = useState<SectionAndPage | null>(null)
  const [revalidationState, setRevalidationState] = useState<RevalidationState>({
    methodToCallOnRevalidation: null,
    shouldProcessValidation: false,
    lastRevalidationRequest: Date.now(),
  })

  const shouldRevalidate = isLastElementUpdateProcessed && revalidationState.shouldProcessValidation
  const minRefetchTimestampForRevalidation =
    shouldRevalidate && wasElementChange ? elementUpdatedTimestamp : 0

  const { error, fullStructure } = useGetFullApplicationStructure({
    structure,
    shouldRevalidate,
    minRefetchTimestampForRevalidation,
  })

  /* Method to pass to progress bar, next button and submit button to cause revalidation before action can be proceeded
     Should always be called on submit, but only be called on next or progress bar navigation when isLinear */
  // TODO may rename if we want to display loading modal ?
  const requestRevalidation: MethodRevalidate = (methodToCall) => {
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
      setRevalidationState({
        ...revalidationState,
        methodToCallOnRevalidation: null,
        shouldProcessValidation: false,
      })
      revalidationState.methodToCallOnRevalidation({
        firstStrictInvalidPage: fullStructure.info.firstStrictInvalidPage,
        setStrictSectionPage,
      })
      // TODO hide loading modal
    }
  }, [revalidationState, fullStructure])

  useEffect(() => {
    if (!fullStructure) return

    // Re-direct based on application status
    if (fullStructure.info.current?.status === ApplicationStatus.ChangesRequired)
      push(`/applicationNEW/${fullStructure.info.serial}`)
    if (structure.info.current?.status !== ApplicationStatus.Draft)
      push(`/applicationNEW/${fullStructure.info.serial}/summary`)

    // Re-direct if trying to access page higher than allowed
    if (!fullStructure.info.isLinear || !fullStructure.info?.firstStrictInvalidPage) return
    const firstIncomplete = fullStructure.info?.firstStrictInvalidPage
    const current = { sectionCode, pageNumber }
    if (!checkPageIsAccessible({ fullStructure, firstIncomplete, current })) {
      const { sectionCode, pageNumber } = firstIncomplete
      push(`/applicationNEW/${structure.info.serial}/${sectionCode}/Page${pageNumber}`)
    }
  }, [structure, fullStructure, sectionCode, page])

  if (error) return <Message error header={strings.ERROR_APPLICATION_PAGE} list={[error]} />
  if (!fullStructure || !fullStructure.responsesByCode) return <Loading />

  const {
    info: { isLinear },
  } = fullStructure

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
          <ProgressBarNEW
            structure={fullStructure}
            requestRevalidation={requestRevalidation}
            strictSectionPage={strictSectionPage}
          />
        </Grid.Column>
        <Grid.Column width={10} stretched>
          <Segment vertical style={{ marginBottom: 20 }}>
            <Header content={fullStructure.sections[sectionCode].details.title} />
            <PageElements
              elements={getCurrentPageElements(fullStructure, sectionCode, pageNumber)}
              responsesByCode={fullStructure.responsesByCode}
              isStrictPage={
                sectionCode === strictSectionPage?.sectionCode &&
                pageNumber === strictSectionPage?.pageNumber
              }
              canEdit
            />
          </Segment>
        </Grid.Column>
        <Grid.Column width={2} />
      </Grid>
      <Navigation
        current={{ sectionCode, pageNumber }}
        isLinear={isLinear}
        sections={fullStructure.sections}
        serialNumber={serialNumber}
        requestRevalidation={requestRevalidation}
      />
    </Segment.Group>
  )
}

export default ApplicationPage

const getCurrentPageElements = (structure: FullStructure, section: string, page: number) => {
  return structure.sections[section].pages[page].state.map(
    (item) => item.element
  ) as ElementStateNEW[]
}
