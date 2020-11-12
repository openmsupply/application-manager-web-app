import { useEffect, useState } from 'react'
import { Application, useGetApplicationQuery } from '../../utils/generated/graphql'
import useTriggerProcessing from '../../utils/hooks/useTriggerProcessing'
import { getApplicationSections } from '../helpers/getSectionsPayload'
import { TemplateSectionPayload } from '../types'

interface useLoadApplicationProps {
  serialNumber: string
}

interface ApplicationDetails {
  name: string
  id: number
}

const useLoadApplication = (props: useLoadApplicationProps) => {
  const { serialNumber } = props
  const [application, setApplication] = useState<ApplicationDetails | undefined>()
  const [templateSections, setSections] = useState<TemplateSectionPayload[]>([])
  const [appStatus, setAppStatus] = useState({})
  const [isReady, setIsReady] = useState(false)

  const { triggerProcessing, error: triggerError } = useTriggerProcessing({
    serialNumber,
    trigger: 'applicationTrigger',
  })

  const { data, loading, error } = useGetApplicationQuery({
    variables: {
      serial: serialNumber,
    },
    skip: triggerProcessing,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (data && data.applications) {
      if (data.applications.nodes.length === 0) return
      if (data.applications.nodes.length > 1)
        console.log('More than one application returned. Only one expected!')
      const application = data.applications.nodes[0] as Application
      setApplication({ name: application.name as string, id: application.id })

      const sections = getApplicationSections(application.applicationSections)
      setSections(sections)

      setAppStatus({
        stage: application?.stage,
        status: application?.status,
        outcome: application?.outcome,
      })
      setIsReady(true)
    }
  }, [data, loading, error])

  return {
    error: error || triggerError,
    loading: loading || triggerProcessing,
    application,
    templateSections,
    appStatus,
    isReady,
  }
}

export default useLoadApplication
