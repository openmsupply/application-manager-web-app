import React from 'react'
import { ApplicationStart, Loading } from '../../components'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useRouter } from '../../utils/hooks/useRouter'
import { Header, Message } from 'semantic-ui-react'
import useLoadTemplate from '../../utils/hooks/useLoadTemplate'
import useCreateApplication from '../../utils/hooks/useCreateApplication'

const ApplicationCreate: React.FC = () => {
  const { applicationState, setApplicationState } = useApplicationState()
  const { serialNumber } = applicationState
  const { push, query } = useRouter()
  const { type } = query

  const {
    apolloError,
    error,
    loading,
    templateType,
    templateSections,
    templateElementsIds,
  } = useLoadTemplate({
    templateCode: type as string,
  })

  const { processing, error: creationError, create } = useCreateApplication({
    onCompleted: () => {
      if (serialNumber && templateSections && templateSections.length > 0) {
        // Call Application page on first section
        const firstSection = templateSections[0].code
        // The pageNumber starts in 1 when is a new application
        push(`${serialNumber}/${firstSection}/page1`)
      }
    },
  })

  const handleCreate = () => {
    setApplicationState({ type: 'reset' })

    if (!templateType || !templateSections) {
      console.log('Problem to create application - unexpected parameters')
      return
    }
    // TODO: New issue to generate serial - should be done in server?
    const serialNumber = Math.round(Math.random() * 10000).toString()
    setApplicationState({ type: 'setSerialNumber', serialNumber })

    create({
      name: `Test application of ${templateType.name}`,
      serial: serialNumber,
      templateId: templateType.id,
      templateSections: templateSections.map((section) => {
        return { templateSectionId: section.id }
      }),
      templateResponses: templateElementsIds.map((id) => {
        return { templateElementId: id }
      }),
    })
  }

  return error || apolloError || creationError ? (
    <Message
      error
      header="Problem to load application creation page"
      list={[error, apolloError?.message, creationError?.message]}
    />
  ) : loading || processing ? (
    <Loading />
  ) : templateType && templateSections ? (
    <ApplicationStart
      template={templateType}
      sections={templateSections}
      handleClick={() => handleCreate()}
    />
  ) : (
    <Header as="h2" icon="exclamation circle" content="No template found!" />
  )
}

export default ApplicationCreate
