import React, { useEffect, useState } from 'react'
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
import { useGetApplicationSerialQuery } from '../../utils/generated/graphql'

const MAX_REFETCH = 10

const ApplicationCreate: React.FC = () => {
  const {
    applicationState: { serialNumber, id },
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
    if (template && !template.startMessage) handleCreate()
  }, [template])

  // Need to re-query the created application to get the new serial
  const [refetchAttempts, setRefetchAttempts] = useState(0)
  const {
    data,
    loading: newApplicationLoading,
    error: newApplicationError,
  } = useGetApplicationSerialQuery({
    variables: {
      id: id as number,
    },
    fetchPolicy: 'network-only',
    skip: !id,
    pollInterval: refetchAttempts > MAX_REFETCH ? 0 : 500,
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      setRefetchAttempts((prev) => prev + 1)
      if (data?.application?.trigger === null) {
        setApplicationState({
          type: 'setSerialNumber',
          serialNumber: data.application.serial as string,
        })
        if (serialNumber && template?.sections && template?.sections.length > 0) {
          // Call Application page on first section
          const firstSection = template.sections[0].code
          // The pageNumber starts in 1 when is a new application
          push(`${serialNumber}/${firstSection}/Page1`)
        }
      }
    },
  })

  const { processing, error: creationError, create } = useCreateApplication()

  const handleCreate = async (_?: any) => {
    setApplicationState({ type: 'reset' })

    if (!template?.sections) {
      console.log('Problem creating application - unexpected parameters')
      return
    }

    const { name, elementsIds, elementsDefaults, sections } = template
    const defaultValues = await getDefaults(elementsDefaults || [], currentUser)

    const mutationResult = await create({
      name,
      templateId: template.id,
      userId: currentUser?.userId,
      orgId: currentUser?.organisation?.orgId,
      sessionId: currentUser?.sessionId as string,
      templateSections: sections.map(({ id }) => ({ templateSectionId: id })),
      templateResponses: (elementsIds as number[]).map((id, index) => ({
        templateElementId: id,
        value: defaultValues[index],
      })),
    })
    const applicationId = mutationResult.data?.createApplication?.application?.id
    if (applicationId) setApplicationState({ type: 'setApplication', id: applicationId })
  }

  if (error || creationError || newApplicationError || refetchAttempts > MAX_REFETCH)
    return (
      <Message
        error
        title={strings.ERROR_APPLICATION_CREATE}
        list={[error, creationError?.message]}
      />
    )

  if (!template) return null
  // if (!template) return <ApplicationSelectType /> // TODO
  if (loading || !template?.startMessage || refetchAttempts > 0) return <Loading />

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
