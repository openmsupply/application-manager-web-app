import React, { useEffect } from 'react'
import { Button, Message, Segment } from 'semantic-ui-react'
import { ApplicationContainer, ApplicationSelectType, Loading } from '../../components'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useUserState } from '../../contexts/UserState'
import useCreateApplication from '../../utils/hooks/useCreateApplication'
import useLoadTemplate from '../../utils/hooks/useLoadTemplate'
import { useRouter } from '../../utils/hooks/useRouter'
import usePageTitle from '../../utils/hooks/usePageTitle'
import strings from '../../utils/constants'
import { SectionsList } from '../../components/Sections'
import ApplicationHomeWrapper from '../../components/Application/ApplicationHomeWrapper'

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
    if (template && !template.startMessage) handleCreate()
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
      name,
      serial: serialNumber,
      templateId: template.id,
      userId: currentUser?.userId,
      orgId: currentUser?.organisation?.orgId,
      sessionId: currentUser?.sessionId as string,
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
        ButtonSegment={StartButtonSegment}
      >
        <SectionsList sections={template.sections} />
      </ApplicationHomeWrapper>
    </ApplicationContainer>
  ) : null
}

export default ApplicationCreate
