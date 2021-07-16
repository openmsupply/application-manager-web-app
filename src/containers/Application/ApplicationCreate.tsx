import React, { useEffect } from 'react'
import { Button, Message, Segment } from 'semantic-ui-react'
import { ApplicationContainer, Loading } from '../../components'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useUserState } from '../../contexts/UserState'
import useCreateApplication from '../../utils/hooks/useCreateApplication'
import useLoadTemplate from '../../utils/hooks/useLoadTemplate'
import { useRouter } from '../../utils/hooks/useRouter'
import usePageTitle from '../../utils/hooks/usePageTitle'
import strings from '../../utils/constants'
import { SectionsList } from '../../components/Sections'
import ApplicationHomeWrapper from '../../components/Application/ApplicationHomeWrapper'
import { ElementForEvaluation, EvaluatorNode, User } from '../../utils/types'
import { evaluateElements } from '../../utils/helpers/evaluateElements'

const ApplicationCreate: React.FC = () => {
  const {
    applicationState: { serialNumber },
    setApplicationState,
  } = useApplicationState()
  const {
    push,
    query: { type },
  } = useRouter()
  const {
    userState: { currentUser },
  } = useUserState()

  const { error, loading, template } = useLoadTemplate({
    templateCode: type,
  })

  usePageTitle(strings.PAGE_TITLE_CREATE)

  // If template has no start message, go straight to first page of new application
  useEffect(() => {
    if (template && !template.startMessage) handleCreate()
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

  const handleCreate = async (_?: any) => {
    setApplicationState({ type: 'reset' })

    if (!template?.sections) {
      console.log('Problem to create application - unexpected parameters')
      return
    }
    // TODO: New issue to generate serial - should be done in server?
    const serialNumber = Math.round(Math.random() * 10000).toString()
    setApplicationState({ type: 'setSerialNumber', serialNumber })

    const { name, elementsIds, elementsDefaults } = template
    const defaultValues = await getDefaultValues(elementsDefaults || [], currentUser)

    create({
      name,
      serial: serialNumber,
      templateId: template.id,
      templateResponses: (elementsIds as number[]).map((id, index) => {
        return { templateElementId: id, value: defaultValues[index] }
      }),
    })
  }

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
        <Button color="blue" className="button-wide" loading={processing} onClick={handleCreate}>
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

const getDefaultValues = async (
  defaultValueExpressions: EvaluatorNode[],
  currentUser: User | null
) => {
  const evaluationElements: ElementForEvaluation[] = defaultValueExpressions.map(
    (defaultValueExpression) => ({ defaultValueExpression, code: '' })
  )

  const evaluatedElements = await evaluateElements(evaluationElements, ['defaultValue'], {
    currentUser,
  })
  return evaluatedElements.map(({ defaultValue }) => defaultValue)
}

export { getDefaultValues }
export default ApplicationCreate
