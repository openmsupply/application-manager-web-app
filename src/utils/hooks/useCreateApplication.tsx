import { ApolloError } from '@apollo/client'
import { useState } from 'react'
import { useUserState } from '../../contexts/UserState'
import { useCreateApplicationMutation } from '../../utils/generated/graphql'

export interface CreateApplicationProps {
  serial: string
  name: string
  templateId: number
  isConfig?: boolean
  templateResponses: { templateElementId: number; value: any }[]
}

interface UseCreateApplicationProps {
  onCompleted: () => void
}

const useCreateApplication = ({ onCompleted }: UseCreateApplicationProps) => {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<ApolloError | undefined>()
  const {
    userState: { currentUser },
  } = useUserState()

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

  const userId = currentUser?.userId
  const orgId = currentUser?.organisation?.orgId
  const sessionId = currentUser?.sessionId || ''

  const createApplication = async ({
    serial,
    name,
    templateId,
    templateResponses,
    isConfig = false,
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
