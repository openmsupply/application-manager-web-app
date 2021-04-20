import { ApolloError } from '@apollo/client'
import { useState } from 'react'
import { useCreateApplicationMutation } from '../../utils/generated/graphql'

interface CreateApplicationProps {
  serial: string
  name: string
  templateId: number
  userId?: number
  orgId?: number
  templateSections: { templateSectionId: number }[]
  templateResponses: { templateElementId: number }[]
}

interface UseCreateApplicationProps {
  onCompleted: () => void
}

const useCreateApplication = ({ onCompleted }: UseCreateApplicationProps) => {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<ApolloError | undefined>()

  const [applicationMutation] = useCreateApplicationMutation({
    onCompleted: () => {
      setProcessing(false)
      onCompleted()
    },
    onError: (error) => {
      setProcessing(false)
      setError(error)
    },
  })

  const createApplication = ({
    serial,
    name,
    templateId,
    userId,
    orgId,
    templateSections,
    templateResponses,
  }: CreateApplicationProps) => {
    setProcessing(true)
    applicationMutation({
      variables: {
        name,
        serial,
        templateId,
        userId,
        orgId,
        sections: templateSections,
        responses: templateResponses,
      },
    })
  }

  return {
    processing,
    error,
    create: createApplication,
  }
}

export default useCreateApplication
