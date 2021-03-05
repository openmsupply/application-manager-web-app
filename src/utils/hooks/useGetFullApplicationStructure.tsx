import { useState, useEffect } from 'react'
import { FullStructure } from '../types'
import {
  ApplicationResponse,
  ApplicationStatus,
  useGetAllResponsesQuery,
} from '../generated/graphql'
import { useUserState } from '../../contexts/UserState'
import { generateResponsesProgress } from '../helpers/structure/generateProgress'
import addEvaluatedResponsesToStructure from '../helpers/structure/addEvaluatedResponsesToStructure'

interface useGetFullApplicationStructureProps {
  structure: FullStructure
  shouldRevalidate?: boolean
  minRefetchTimestampForRevalidation?: number
  firstRunValidation?: boolean
}

const useGetFullApplicationStructure = ({
  structure,
  shouldRevalidate = false,
  minRefetchTimestampForRevalidation = 0,
  firstRunValidation = true,
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

    addEvaluatedResponsesToStructure({
      structure,
      applicationResponses: data?.applicationBySerial?.applicationResponses
        ?.nodes as ApplicationResponse[],
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

      generateResponsesProgress(newStructure)

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
