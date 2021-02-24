import React, { useEffect, useState } from 'react'
import { FullStructure, ResponsesByCode } from '../../utils/types'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useUserState } from '../../contexts/UserState'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading, NoMatch } from '../../components'
import strings from '../../utils/constants'
import messages from '../../utils/messages'
import { Button, Grid, Header, Segment, Sticky } from 'semantic-ui-react'
import { revalidateAll } from '../../utils/helpers/validation/revalidateAll'
import ApplicationPageWrapper from './ApplicationPageWrapper'
import { ApplicationViewWrapper } from '../../formElementPlugins'

interface ApplicationProps {
  structure: FullStructure
  responses?: ResponsesByCode
}

// TODO relocate to sharable type

type LastValidPage = { sectionCode: string; pageName: string } | null

interface MethodToCallOnRevalidation {
  (firstInvalidPage: LastValidPage): null
}

const getFirstInvalidPage: (
  fullStructure: FullStructure
) => { sectionCode: string; pageName: string } | null = (fullStructure) => {
  // return { sectionCode: 'S1', pageName: 'Page 2' }
  return null
}

const ApplicationPage: React.FC<ApplicationProps> = ({ structure }) => {
  const [isStrictPage, setIsStrictPage] = useState<LastValidPage>(null)

  const {
    applicationState: {
      inputElementsActivity: { areTimestampsInSequence, elementsStateUpdatedTimestamp },
    },
  } = useApplicationState()

  const [revalidationState, setRevalidationState] = useState({
    methodToCallOnRevalidation: null,
    shouldProcessValidation: false,
    lastRevalidationRequest: Date.now(),
  })

  const shouldRevalidate = areTimestampsInSequence && revalidationState.shouldProcessValidation
  const revalidateAfterTimestamp = shouldRevalidate ? elementsStateUpdatedTimestamp : 0

  const { error, fullStructure } = useGetFullApplicationStructure({
    structure,
    shouldRevalidate,
    revalidateAfterTimestamp,
  })
  const {
    userState: { currentUser },
  } = useUserState()
  const { push } = useRouter()

  /* Method to pass to progress bar, next button and submit button  to cause revalidation before aciton can be proceeded
     Should always be called on submit, but only be called on next or progress bar navigation when isLinear */
  // TODO may rename if we want to display loading modal
  const requestRevalidation = (methodToCall: MethodToCallOnRevalidation) => {
    setRevalidationState({
      methodToCallOnRevalidation: methodToCall,
      shouldProcessValidation: true,
      lastRevalidationRequest: Date.now(),
    })
    // TODO show loading modal
  }

  useEffect(() => {
    if (
      revalidationState.methodToCallOnRevalidation &&
      (fullStructure?.lastValidationTimestamp || new Date('00-00-00')) >
        revalidationState.lastRevalidationRequest
    ) {
      const lastValidPage = getFirstInvalidPage(fullStructure)
      console.log('S1Q3 after revalidation', fullStructure.sections.S1.pages['Page 1'].state[3])
      setRevalidationState({
        ...revalidationState,
        methodToCallOnRevalidation: null,
        shouldProcessValidation: false,
      })
      if (lastValidPage != null) setIsStrictPage(lastValidPage)
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

  console.log({
    revalidationState,
    lastValidationTimestamp: fullStructure?.lastValidationTimestamp,
    areTimestampsInSequence,
  })

  if (error) return <NoMatch />
  if (!fullStructure) return <Loading />
  console.log('S1Q3 Before render', fullStructure.sections.S1.pages['Page 1'].state[3])
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
          <ProgressBar structure={structure} />
        </Grid.Column>
        <Grid.Column width={10} stretched>
          <Segment basic>
            <PageElements
              structure={fullStructure}
              responses={fullStructure.responsesByCode}
              requestRevalidation={requestRevalidation}
            />
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
          <Button color="blue" onClick={() => {}}>
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

const PageElements: React.FC<ApplicationProps> = ({
  structure,
  responses,
  requestRevalidation,
}) => {
  const ps1p1q2 = structure?.sections.S1.pages['Page 1'].state[1] || {}
  const ps1p1q3 = structure?.sections.S1.pages['Page 1'].state[2] || {}
  const ps1p1q4 = structure?.sections.S1.pages['Page 1'].state[3] || {}

  const callThisMethod = (data: any) => {
    console.log('Validating done', data)
  }
  // Placeholder -- to be replaced with new component
  return (
    <div>
      <ApplicationViewWrapper
        key={1}
        {...{
          ...ps1p1q2.element,
          initialValue: responses[ps1p1q2.element.code],
          currentResponse: ps1p1q2.response,
          allResponses: responses,
        }}
      />
      <ApplicationViewWrapper
        key={2}
        {...{
          ...ps1p1q3.element,
          initialValue: responses[ps1p1q3.element.code],
          currentResponse: ps1p1q3.response,
          allResponses: responses,
        }}
      />
      <ApplicationViewWrapper
        key={3}
        {...{
          ...ps1p1q4.element,
          initialValue: responses[ps1p1q4.element.code],
          currentResponse: ps1p1q4.response,
          allResponses: responses,
        }}
      />
      <p>Page Elements go here</p>
      {/* <pre>{JSON.stringify(ps1p1q2 || {}, null, ' ')}</pre>
      <pre>{JSON.stringify(ps1p1q3 || {}, null, ' ')}</pre> */}
      <pre>{JSON.stringify(ps1p1q4 || {}, null, ' ')}</pre>
      <Button onClick={() => requestRevalidation(callThisMethod)}>revalidate</Button>
    </div>
  )
}

const NavigationBox: React.FC = () => {
  // Placeholder -- to be replaced with new component
  return <p>Navigation Buttons</p>
}

export default ApplicationPage
