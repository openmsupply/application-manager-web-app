import { ApolloError } from '@apollo/client'
import { useState } from 'react'
import { useCreateApplicationMutation } from '../../utils/generated/graphql'

export interface createApplicationProps {
  serial: string
  name: string
  templateId: number
  templateSections: { templateSectionId: number }[]
  templateResponses: { templateElementId: number }[]
}

interface useCreateApplicationProps {
  onCompleted: () => void
}

const useCreateApplication = ({ onCompleted }: useCreateApplicationProps) => {
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
    templateSections,
    templateResponses,
  }: createApplicationProps) => {
    setProcessing(true)
    applicationMutation({
      variables: {
        name,
        serial,
        templateId,
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
