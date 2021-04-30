import React, { useEffect } from 'react'
import { Button, Message, Segment } from 'semantic-ui-react'
import { ApplicationHeader, ApplicationSelectType, Loading } from '../../components'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useUserState } from '../../contexts/UserState'
import useCreateApplication from '../../utils/hooks/useCreateApplication'
import useLoadTemplate from '../../utils/hooks/useLoadTemplate'
import { useRouter } from '../../utils/hooks/useRouter'
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

  return template?.sections ? (
    <ApplicationHeader template={template} currentUser={currentUser}>
      <ApplicationHomeWrapper startMessage={template.startMessage}>
        <SectionsList sections={template.sections} />
      </ApplicationHomeWrapper>
      <Segment basic className="padding-zero">
        <Button color="blue" className="wide" loading={processing} onClick={handleCreate}>
          {strings.BUTTON_APPLICATION_START}
        </Button>
      </Segment>
    </ApplicationHeader>
  ) : null
}

export default ApplicationCreate
