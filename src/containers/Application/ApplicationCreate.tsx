import React, { useEffect } from 'react'
import { Button, Message, Segment } from 'semantic-ui-react'
import { ApplicationContainer, Loading } from '../../components'
import { ApplicationActions, useApplicationState } from '../../contexts/ApplicationState'
import { useUserState } from '../../contexts/UserState'
import useCreateApplication, {
  CreateApplicationProps,
} from '../../utils/hooks/useCreateApplication'
import useLoadTemplate from '../../utils/hooks/useLoadTemplate'
import { useRouter } from '../../utils/hooks/useRouter'
import usePageTitle from '../../utils/hooks/usePageTitle'
import strings from '../../utils/constants'
import { SectionsList } from '../../components/Sections'
import ApplicationHomeWrapper from '../../components/Application/ApplicationHomeWrapper'
import { ElementForEvaluation, EvaluatorNode, TemplateDetails, User } from '../../utils/types'
import { evaluateElements } from '../../utils/helpers/evaluateElements'

type HandlerCreate = (props: {
  template?: TemplateDetails
  currentUser: User | null
  create: (props: CreateApplicationProps) => Promise<void>
  setApplicationState?: React.Dispatch<ApplicationActions>
  isConfig?: boolean
}) => Promise<string>

export const handleCreate: HandlerCreate = async ({
  setApplicationState,
  create,
  currentUser,
  template,
  isConfig = false,
}) => {
  if (setApplicationState) setApplicationState({ type: 'reset' })

  // TODO: New issue to generate serial - should be done in server?
  const serialNumber = Math.round(Math.random() * 10000).toString()
  if (setApplicationState) setApplicationState({ type: 'setSerialNumber', serialNumber })

  const {
    name = 'no name',
    elementsIds = [],
    elementsDefaults = [],
    sections = [],
    id = 0,
  } = template || {}
  const defaultValues = await getDefaults(elementsDefaults, currentUser)

  await create({
    name,
    serial: serialNumber,
    templateId: id,
    isConfig,
    userId: currentUser?.userId,
    orgId: currentUser?.organisation?.orgId,
    sessionId: currentUser?.sessionId as string,
    templateSections: sections.map(({ id }) => {
      return { templateSectionId: id }
    }),
    templateResponses: (elementsIds as number[]).map((id, index) => {
      return { templateElementId: id, value: defaultValues[index] }
    }),
  })

  return serialNumber
}

const ApplicationCreate: React.FC = () => {
  const {
    applicationState: { serialNumber },
    setApplicationState,
  } = useApplicationState()
  const {
    push,
    query: { type },
  } = useRouter()

  const { error, loading, template } = useLoadTemplate({
    templateCode: type,
  })

  usePageTitle(strings.PAGE_TITLE_CREATE)

  const {
    userState: { currentUser },
  } = useUserState()

  // If template has no start message, go straight to first page of new application
  useEffect(() => {
    if (template && !template.startMessage)
      handleCreate({ template, create, setApplicationState, currentUser })
  }, [template])

  const {
    processing,
    error: creationError,
    create,
  } = useCreateApplication({
    onCompleted: () => {
      if (serialNumber && template?.sections && template?.sections.length > 0) {
        // Call Application page on first section
        const firstSection = template.sections[0].code
        // The pageNumber starts in 1 when is a new application
        push(`${serialNumber}/${firstSection}/Page1`)
      }
    },
  })

  if (error || creationError)
    return (
      <Message
        error
        title={strings.ERROR_APPLICATION_CREATE}
        list={[error, creationError?.message]}
      />
    )

  if (!template) return null
  // if (!template) return <ApplicationSelectType /> // TODO
  if (loading || !template?.startMessage) return <Loading />

  const StartButtonSegment: React.FC = () => {
    return (
      <Segment basic className="padding-zero">
        <Button
          color="blue"
          className="button-wide"
          loading={processing}
          onClick={() => handleCreate({ template, create, setApplicationState, currentUser })}
        >
          {strings.BUTTON_APPLICATION_START}
        </Button>
      </Segment>
    )
  }

  return template?.sections ? (
    <ApplicationContainer template={template}>
      <ApplicationHomeWrapper
        startMessage={template.startMessage}
        name={template.name}
        title={strings.TITLE_INTRODUCTION}
        subtitle={strings.SUBTITLE_APPLICATION_STEPS}
        ButtonSegment={StartButtonSegment}
      >
        <SectionsList sections={template.sections} />
      </ApplicationHomeWrapper>
    </ApplicationContainer>
  ) : null
}

const getDefaults = async (defaultValueExpressions: EvaluatorNode[], currentUser: User | null) => {
  const evaluationElements: ElementForEvaluation[] = defaultValueExpressions.map(
    (defaultValueExpression) => ({ defaultValueExpression, code: '' })
  )

  const evaluatedElements = await evaluateElements(evaluationElements, ['defaultValue'], {
    currentUser,
  })
  return evaluatedElements.map(({ defaultValue }) => defaultValue)
}

export default ApplicationCreate
