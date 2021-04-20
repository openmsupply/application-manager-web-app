import { useEffect, useState } from 'react'
import {
  ApplicationDetails,
  ElementBase,
  FullStructure,
  TemplateDetails,
  TemplateElementState,
  UseGetApplicationProps,
} from '../types'
import evaluate from '@openmsupply/expression-evaluator'
import { useUserState } from '../../contexts/UserState'
import { EvaluatorParameters } from '../types'
import { getApplicationSections } from '../helpers/application/getSectionsDetails'
import {
  Application,
  ApplicationSection,
  ApplicationStageStatusAll,
  ApplicationStatus,
  Organisation,
  Template,
  TemplateElement,
  TemplateStage,
  useGetApplicationQuery,
  User,
} from '../generated/graphql'
import messages from '../messages'
import { buildSectionsStructure } from '../helpers/structure'
import config from '../../config.json'

const graphQLEndpoint = config.serverGraphQL

const MAX_REFETCH = 10

const useLoadApplication = ({ serialNumber, networkFetch }: UseGetApplicationProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [structureError, setStructureError] = useState('')
  const [structure, setFullStructure] = useState<FullStructure>()
  const [template, setTemplate] = useState<TemplateDetails>()
  const [refetchAttempts, setRefetchAttempts] = useState(0)
  const {
    userState: { currentUser },
  } = useUserState()

  const { data, loading, error, refetch } = useGetApplicationQuery({
    variables: {
      serial: serialNumber,
    },
    fetchPolicy: networkFetch ? 'network-only' : 'cache-first',
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    if (loading) {
      setIsLoading(true)
      return
    }
    if (!data) return

    const application = data.applicationBySerial as Application

    // No unexpected error - just a application not accessible to user (Show 404 page)
    if (!application) {
      setIsLoading(false)
      return
    }

    if (!application.template) {
      setStructureError(messages.APPLICATION_MISSING_TEMPLATE)
      return
    }

    // Building the structure...
    setIsLoading(true)

    // Checking if trigger is running before loading current status
    if (application.trigger === null) {
      setRefetchAttempts(0)
    } else {
      if (refetchAttempts < MAX_REFETCH) {
        setTimeout(() => {
          console.log('Will refetch loadApplication', refetchAttempts) // TODO: Remove log
          setRefetchAttempts(refetchAttempts + 1)
          refetch()
        }, 500)
      } else setStructureError(messages.TRIGGER_RUNNING)
      return
    }

    const { id, code, name, startMessage } = application.template as Template

    setTemplate({
      id,
      code,
      name: name as string,
      startMessage: startMessage ? startMessage : undefined,
    })

    const applicationSection = application.applicationSections.nodes as ApplicationSection[]
    const sections = getApplicationSections(applicationSection)

    const stages = data.applicationStageStatusLatests?.nodes as ApplicationStageStatusAll[]
    if (stages.length > 1) console.log('StageStatusAll More than one results for 1 application!')
    const { stageId, stage, status, statusHistoryTimeCreated } = stages[0] // Should only have one result

    const applicationDetails: ApplicationDetails = {
      id: application.id,
      type: application.template?.name as string,
      isLinear: application.template?.isLinear as boolean,
      serial: application.serial as string,
      name: application.name as string,
      outcome: application.outcome as string,
      current: {
        stage: {
          id: stageId as number,
          name: stage as string,
        },
        status: status as ApplicationStatus,
        date: statusHistoryTimeCreated,
      },
      firstStrictInvalidPage: null,
      isChangeRequest: false,
      user: application?.user as User,
      org: application?.org as Organisation,
      config,
    }

    const baseElements: ElementBase[] = []
    application.applicationSections.nodes.forEach((sectionNode) => {
      let pageCount = 1
      const elementsInSection = sectionNode?.templateSection?.templateElementsBySectionId
        ?.nodes as TemplateElement[]
      elementsInSection.forEach((element) => {
        if (element.elementTypePluginCode === 'pageBreak') pageCount++
        else
          baseElements.push({
            // ...element,
            category: element.category,
            id: element.id,
            code: element.code,
            pluginCode: element.elementTypePluginCode,
            sectionIndex: sectionNode?.templateSection?.index,
            sectionCode: sectionNode?.templateSection?.code,
            elementIndex: element.index,
            page: pageCount,
            isEditableExpression: element.isEditable,
            isRequiredExpression: element.isRequired,
            isVisibleExpression: element.visibilityCondition,
            parameters: element.parameters,
            validationExpression: element.validation,
            validationMessage: element.validationMessage,
          } as TemplateElementState)
      })
    })

    const templateStages = application.template?.templateStages.nodes as TemplateStage[]

    const evaluatorParams: EvaluatorParameters = {
      objects: { currentUser, applicationData: applicationDetails },
      APIfetch: fetch,
      graphQLConnection: { fetch: fetch.bind(window), endpoint: graphQLEndpoint },
    }
    evaluate(application.template?.submissionMessage || '', evaluatorParams).then(
      (submissionMessage: any) => {
        let newStructure: FullStructure = {
          info: { ...applicationDetails, submissionMessage },
          stages: templateStages.map((stage) => ({
            number: stage.number as number,
            id: stage.id,
            title: stage.title as string,
            description: stage.description ? stage.description : undefined,
          })),
          sections: buildSectionsStructure({ sections, baseElements }),
        }

        setFullStructure(newStructure)
        setIsLoading(false)
      }
    )
  }, [data, loading])

  return {
    error: structureError || error?.message,
    isLoading: loading || isLoading,
    structure,
    template,
  }
}

export default useLoadApplication
