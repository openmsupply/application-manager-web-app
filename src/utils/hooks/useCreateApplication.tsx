import { ApolloError } from '@apollo/client'
import { useState } from 'react'
import { useCreateApplicationMutation } from '../../utils/generated/graphql'

export interface CreateApplicationProps {
  serial: string
  name: string
  templateId: number
  userId?: number
  orgId?: number
  sessionId: string
  isConfig: boolean
  templateResponses: { templateElementId: number; value: any }[]
}

type UseCreateApplicationMutationReturnType = ReturnType<typeof useCreateApplicationMutation>
export type CreateApplicationReturnType = ReturnType<UseCreateApplicationMutationReturnType[0]>

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

  const createApplication = async ({
    serial,
    name,
    templateId,
    userId,
    orgId,
    sessionId,
    templateResponses,
    isConfig,
  }: CreateApplicationProps) => {
    setProcessing(true)
    const result = await applicationMutation({
      variables: {
        isConfig,
        name,
        serial,
        templateId,
        userId,
        orgId,
        sessionId,
        responses: templateResponses,
      },
    })
    return result
  }

  return {
    processing,
    error,
    create: createApplication,
  }
}

export default useCreateApplication
