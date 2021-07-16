import { ApolloError } from '@apollo/client'
import { useState } from 'react'
import { useCreateApplicationMutation } from '../../utils/generated/graphql'

interface CreateApplicationProps {
  name: string
  templateId: number
  userId?: number
  orgId?: number
  sessionId: string
  templateSections: { templateSectionId: number }[]
  templateResponses: { templateElementId: number; value: any }[]
}

const useCreateApplication = () => {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<ApolloError | undefined>()

  const [applicationMutation] = useCreateApplicationMutation({
    onCompleted: () => {
      setProcessing(false)
    },
    onError: (error) => {
      setProcessing(false)
      setError(error)
    },
  })

  const createApplication = async ({
    name,
    templateId,
    userId,
    orgId,
    sessionId,
    templateSections,
    templateResponses,
  }: CreateApplicationProps) => {
    setProcessing(true)
    const mutationResult = await applicationMutation({
      variables: {
        name,
        templateId,
        userId,
        orgId,
        sessionId,
        sections: templateSections,
        responses: templateResponses,
      },
    })
    return mutationResult
  }

  return {
    processing,
    error,
    create: createApplication,
  }
}

export default useCreateApplication
