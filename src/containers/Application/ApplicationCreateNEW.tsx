import React, { useEffect, useState } from 'react'
import { Button, Divider, Header, Message, Segment } from 'semantic-ui-react'
import evaluate from '@openmsupply/expression-evaluator'
import Markdown from '../../utils/helpers/semanticReactMarkdown'
import { ApplicationHeader, ApplicationSelectType, Loading } from '../../components'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useUserState } from '../../contexts/UserState'
import useCreateApplication from '../../utils/hooks/useCreateApplication'
import useLoadTemplate from '../../utils/hooks/useLoadTemplateNEW'
import { useRouter } from '../../utils/hooks/useRouter'
import strings from '../../utils/constants'
import { EvaluatorParameters } from '../../utils/types'
import { SectionsList } from '../../components/Application/Sections'

const ApplicationCreateNEW: React.FC = () => {
  const {
    applicationState: { serialNumber },
    setApplicationState,
  } = useApplicationState()
  const {
    push,
    query: { type },
  } = useRouter()
  const [startMessageEvaluated, setStartMessageEvaluated] = useState('')

  const { error, loading, template } = useLoadTemplate({
    templateCode: type,
  })

  const {
    userState: { currentUser },
  } = useUserState()

  // If template has no start message, go straight to first page of new application
  useEffect(() => {
    if (template && !template.startMessage) handleCreate()
    else evaluateMessage()
  }, [template])

  const { processing, error: creationError, create } = useCreateApplication({
    onCompleted: () => {
      if (serialNumber && template?.sections && template?.sections.length > 0) {
        // Call Application page on first section
        const firstSection = template.sections[0].code
        // The pageNumber starts in 1 when is a new application
        push(`${serialNumber}/${firstSection}/Page1`)
      }
    },
  })

  const evaluateMessage = async () => {
    const evaluatorParams: EvaluatorParameters = {
      objects: { currentUser },
      APIfetch: fetch,
    }
    evaluate(template?.startMessage || '', evaluatorParams).then((result: any) =>
      setStartMessageEvaluated(result)
    )
  }

  const handleCreate = (_?: any) => {
    setApplicationState({ type: 'reset' })

    if (!template?.sections) {
      console.log('Problem to create application - unexpected parameters')
      return
    }
    // TODO: New issue to generate serial - should be done in server?
    const serialNumber = Math.round(Math.random() * 10000).toString()
    setApplicationState({ type: 'setSerialNumber', serialNumber })

    const { name, elementsIds, sections } = template

    create({
      name: template.name,
      serial: serialNumber,
      templateId: template.id,
      userId: currentUser?.userId,
      orgId: currentUser?.organisation?.orgId,
      templateSections: sections.map(({ id }) => {
        return { templateSectionId: id }
      }),
      templateResponses: (elementsIds as number[]).map((id) => {
        return { templateElementId: id }
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

  if (loading || !template?.startMessage) return <Loading />

  const NewApplicationInfo: React.FC = () => {
    return template?.sections ? (
      <Segment basic>
        <Header as="h5">{strings.SUBTITLE_APPLICATION_STEPS}</Header>
        <Header as="h5">{strings.TITLE_STEPS.toUpperCase()}</Header>
        <SectionsList sections={template.sections} />
        <Divider />
        <Markdown text={startMessageEvaluated} semanticComponent="Message" info />
        <Button color="blue" loading={processing} onClick={handleCreate}>
          {strings.BUTTON_APPLICATION_START}
        </Button>
      </Segment>
    ) : null
  }

  return template ? (
    <ApplicationHeader
      template={template}
      currentUser={currentUser}
      ChildComponent={NewApplicationInfo}
    />
  ) : (
    // TODO
    <ApplicationSelectType />
  )
}

export default ApplicationCreateNEW
