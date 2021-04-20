import React, { useState, useEffect } from 'react'
import { Switch, Route } from 'react-router-dom'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading, NoMatch } from '../../components'
import {
  SectionAndPage,
  MethodRevalidate,
  MethodToCallProps,
  ApplicationProps,
} from '../../utils/types'
import strings from '../../utils/constants'
import { Message } from 'semantic-ui-react'
import { ApplicationPage, ApplicationSummary } from '.'
import useGetApplicationStructure from '../../utils/hooks/useGetApplicationStructure'
import { useFormElementUpdateTracker } from '../../contexts/FormElementUpdateTrackerState'

interface MethodToCall {
  (props: MethodToCallProps): void
}

interface RevalidationState {
  methodToCallOnRevalidation: MethodToCall | null
  shouldProcessValidation: boolean
  lastRevalidationRequest: number
}

const ApplicationPageWrapper: React.FC<ApplicationProps> = ({ structure }) => {
  const {
    match: { path },
  } = useRouter()

  const {
    state: { isLastElementUpdateProcessed, elementUpdatedTimestamp, wasElementChanged },
  } = useFormElementUpdateTracker()

  const [strictSectionPage, setStrictSectionPage] = useState<SectionAndPage | null>(null)
  const [revalidationState, setRevalidationState] = useState<RevalidationState>({
    methodToCallOnRevalidation: null,
    shouldProcessValidation: false,
    lastRevalidationRequest: Date.now(),
  })

  const shouldRevalidate = isLastElementUpdateProcessed && revalidationState.shouldProcessValidation
  const minRefetchTimestampForRevalidation =
    shouldRevalidate && wasElementChanged ? elementUpdatedTimestamp : 0

  const { error, fullStructure } = useGetApplicationStructure({
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
      revalidationState.methodToCallOnRevalidation({
        firstStrictInvalidPage: fullStructure.info.firstStrictInvalidPage,
        setStrictSectionPage,
      })
      setRevalidationState({
        ...revalidationState,
        methodToCallOnRevalidation: null,
        shouldProcessValidation: false,
      })
      // TODO hide loading modal
    }
  }, [revalidationState, fullStructure])

  if (error) return <Message error header={strings.ERROR_APPLICATION_PAGE} list={[error]} />

  if (!fullStructure || !fullStructure.responsesByCode) return <Loading />

  return (
    <Switch>
      <Route exact path={`${path}/:sectionCode/Page:page`}>
        <ApplicationPage
          structure={fullStructure}
          requestRevalidation={requestRevalidation as MethodRevalidate}
          strictSectionPage={strictSectionPage}
        />
      </Route>
      <Route exact path={`${path}/summary`}>
        <ApplicationSummary
          structure={fullStructure}
          requestRevalidation={requestRevalidation}
          strictSectionPage={strictSectionPage}
        />
      </Route>
      <Route>
        <NoMatch />
      </Route>
    </Switch>
  )
}

export default ApplicationPageWrapper
