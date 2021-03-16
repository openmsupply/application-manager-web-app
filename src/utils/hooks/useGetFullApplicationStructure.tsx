import { useState, useEffect } from 'react'
import { FullStructure, PageNEW, SectionStateNEW } from '../types'
import {
  ApplicationResponse,
  ApplicationStatus,
  ReviewResponseDecision,
  useGetAllResponsesQuery,
} from '../generated/graphql'
import { useUserState } from '../../contexts/UserState'
import { generateResponsesProgress } from '../helpers/structure/generateProgress'
import addEvaluatedResponsesToStructure from '../helpers/structure/addEvaluatedResponsesToStructure'
import addElementsById from '../helpers/structure/addElementsById'
import deepEqual from 'deep-equal'
import generateApplicantChangesRequestedProgress from '../helpers/structure/generateApplicantChangesRequestedProgress'
import addSortedSectionsAndPages from '../helpers/structure/addSortedSectionsAndPages'
import addApplicationResponses from '../helpers/structure/addApplicationResponses'
import addApplicantChangeRequestStatusToElement from '../helpers/structure/addApplicantChangeRequestStatusToElement'

interface useGetFullApplicationStructureProps {
  structure: FullStructure
  shouldRevalidate?: boolean
  minRefetchTimestampForRevalidation?: number
  firstRunValidation?: boolean
  shouldCalculateProgress?: boolean
}

const useGetFullApplicationStructure = ({
  structure,
  shouldRevalidate = false,
  minRefetchTimestampForRevalidation = 0,
  firstRunValidation = true,
  shouldCalculateProgress = true,
}: useGetFullApplicationStructureProps) => {
  const {
    info: { serial },
  } = structure
  const {
    userState: { currentUser },
  } = useUserState()
  const [fullStructure, setFullStructure] = useState<FullStructure>()
  const [firstRunProcessValidation, setFirstRunProcessValidation] = useState(
    firstRunValidation && structure.info.current?.status === ApplicationStatus.Draft
  )

  const [lastRefetchedTimestamp, setLastRefetchedTimestamp] = useState<number>(0)
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState<number>(0)

  const networkFetch = true // To-DO: make this conditional

  const { data, error } = useGetAllResponsesQuery({
    variables: {
      serial,
    },
    skip: !serial,
    fetchPolicy: networkFetch ? 'network-only' : 'cache-first',
  })

  // TODO - might need a use effect if serial is changes (navigated to another application from current page)

  useEffect(() => {
    if (!data) return
    setLastRefetchedTimestamp(Date.now())
  }, [data])

  useEffect(() => {
    if (error) return

    if (!data) return

    const isDataUpToDate = lastProcessedTimestamp > lastRefetchedTimestamp
    const shouldRevalidationWaitForRefetech =
      minRefetchTimestampForRevalidation > lastRefetchedTimestamp
    const shouldRevalidateThisRun = shouldRevalidate && !shouldRevalidationWaitForRefetech

    if (isDataUpToDate && !shouldRevalidateThisRun) return

    const shouldDoValidation = shouldRevalidateThisRun || firstRunProcessValidation
    const applicationResponses = data?.applicationBySerial?.applicationResponses
      ?.nodes as ApplicationResponse[]

    addEvaluatedResponsesToStructure({
      structure,
      applicationResponses,
      currentUser,
      evaluationOptions: {
        isEditable: true,
        isVisible: true,
        isRequired: true,
        isValid: shouldDoValidation,
      },
    }).then((newStructure: FullStructure) => {
      if (shouldDoValidation) {
        newStructure.lastValidationTimestamp = Date.now()
      }

      newStructure = addElementsById(newStructure)
      newStructure = addSortedSectionsAndPages(newStructure)

      // even thought response is already added to element, we need to Latest and Previous applicaiton response
      addApplicationResponses(newStructure, applicationResponses)

      if (shouldCalculateProgress) {
        addApplicantChangeRequestStatusToElement(newStructure)

        generateApplicantChangesRequestedProgress(newStructure)

        // generateResponseProgress uses change statuses calculated in generateApplicantChangesRequestedProgress
        generateResponsesProgress(newStructure)

        // For change requests we treat application as not linear
        newStructure.info.isLinear =
          newStructure.info.isLinear && !newStructure.info.isChangeRequest
      }

      setLastProcessedTimestamp(Date.now())
      setFirstRunProcessValidation(false)

      setFullStructure(newStructure)
    })
  }, [lastRefetchedTimestamp, shouldRevalidate, minRefetchTimestampForRevalidation, error])

  return {
    fullStructure,
    error: error?.message,
  }
}

export default useGetFullApplicationStructure
