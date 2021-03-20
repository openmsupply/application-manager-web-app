import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import {
  Application,
  ApplicationSection,
  ApplicationStageStatusAll,
  ApplicationStatus,
  Template,
  TemplateStage,
  useGetApplicationQuery,
  useGetApplicationStatusQuery,
} from '../../utils/generated/graphql'
import useTriggerProcessing from '../../utils/hooks/useTriggerProcessing'
import { getApplicationSections } from '../helpers/application/getSectionsDetails'
import {
  ApplicationDetails,
  ApplicationStages,
  SectionDetails,
  TemplateDetails,
  UseGetApplicationProps,
} from '../types'

// TODO: Remove this

const useLoadApplication = ({ serialNumber, networkFetch }: UseGetApplicationProps) => {
  const [application, setApplication] = useState<ApplicationDetails>()
  const [template, setTemplate] = useState<TemplateDetails>()
  const [sections, setSections] = useState<SectionDetails[]>([])
  const [appStages, setAppStages] = useState<ApplicationStages>()
  const [isApplicationReady, setIsApplicationReady] = useState(false)
  const [isApplicationLoaded, setIsApplicationLoaded] = useState(false)
  const [applicationError, setApplicationError] = useState<string>()

  const { data, loading, error } = useGetApplicationQuery({
    variables: {
      serial: serialNumber,
    },
    skip: isApplicationReady,
    fetchPolicy: networkFetch ? 'network-only' : 'cache-first',
  })

  const { error: triggerError, isTriggerProcessing } = useTriggerProcessing({
    isApplicationLoaded,
    serialNumber,
    // triggerType: 'applicationTrigger',
  })

  const {
    data: statusData,
    loading: statusLoading,
    error: statusError,
  } = useGetApplicationStatusQuery({
    variables: { serial: serialNumber },
    skip: !isApplicationLoaded || isTriggerProcessing,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (isApplicationReady) return
    if (!loading && !data?.applicationBySerial) {
      setApplicationError('No application found')
      return
    }

    if (data?.applicationBySerial) {
      const application = data.applicationBySerial as Application

      const applicationDetails: ApplicationDetails = {
        id: application.id,
        type: application.template?.name as string,
        isLinear: application.template?.isLinear as boolean,
        serial: application.serial as string,
        name: application.name as string,
        outcome: application.outcome as string,
        firstStrictInvalidPage: null, // Added for new FullStructure
        isChangeRequest: false, // Added for new FullStructure
      }

      setApplication(applicationDetails)

      const { id, code, name, startMessage } = application.template as Template

      setTemplate({
        id,
        code,
        name: name as string,
        startMessage: startMessage ? startMessage : undefined,
      })

      const applicationSection = application.applicationSections.nodes as ApplicationSection[]
      const sections = getApplicationSections(applicationSection)
      setSections(sections)

      const templateStages = application.template?.templateStages.nodes as TemplateStage[]

      setAppStages({
        stages: templateStages.map((stage) => ({
          number: stage.number as number,
          title: stage.title as string,
          id: stage.id,
          description: stage.description ? stage.description : undefined,
        })),
        submissionMessage: application.template?.submissionMessage as string,
      })

      setIsApplicationLoaded(true)
    }
  }, [data, loading])

  useEffect(() => {
    if (isApplicationLoaded && application && !isTriggerProcessing) {
      if (!statusData?.applicationStageStatusAlls?.nodes) {
        setApplicationError('No status found')
        return
      }

      const stages = statusData.applicationStageStatusAlls.nodes as ApplicationStageStatusAll[]
      if (stages.length > 1) console.log('StageStatusAll More than one results for 1 application!')
      const { stageId, stage, status, statusHistoryTimeCreated } = stages[0] // Should only have one result
      setApplication({
        ...application,
        current: {
          stage: {
            id: stageId as number,
            name: stage as string,
          },
          status: status as ApplicationStatus,
          date: statusHistoryTimeCreated,
        },
      })
      setIsApplicationReady(true)
    }
  }, [statusData, statusError])

  return {
    error: error
      ? (error.message as string)
      : statusError
      ? (statusError.message as string)
      : applicationError || triggerError,
    loading: loading || statusLoading || isTriggerProcessing,
    application,
    appStages,
    template,
    sections,
    isApplicationReady,
  }
}

export default useLoadApplication
