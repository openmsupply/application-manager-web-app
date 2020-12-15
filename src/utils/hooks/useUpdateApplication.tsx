import { ApolloError } from '@apollo/client'
import { useEffect, useState } from 'react'
import {
  ApplicationResponse,
  Trigger,
  useGetElementsAndResponsesQuery,
  useUpdateApplicationMutation,
} from '../generated/graphql'

interface useUpdateApplicationProps {
  applicationSerial: string
  applicationTrigger?: Trigger
}

const useUpdateApplication = ({ applicationSerial }: useUpdateApplicationProps) => {
  const [submitted, setSubmitted] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<ApolloError | undefined>()

  // Hook to get existing responses in cache - triggered when user submits application
  const { data, error: responsesError } = useGetElementsAndResponsesQuery({
    variables: {
      serial: applicationSerial,
    },
    skip: !submitted,
    fetchPolicy: 'cache-only',
  })

  const [applicationSubmitMutation] = useUpdateApplicationMutation({
    onCompleted: () => {
      setProcessing(false)
    },
    onError: (submitionError) => {
      setProcessing(false)
      setError(submitionError)
    },
  })

  useEffect(() => {
    if (responsesError) {
      setProcessing(false)
      setError(responsesError)
    }
    if (
      !data?.applicationBySerial?.applicationResponses ||
      data?.applicationBySerial?.applicationResponses.nodes.length === 0
    )
      return

    // Transform in array to be included in update patch
    const responses = data?.applicationBySerial?.applicationResponses.nodes as ApplicationResponse[]
    const responsesPatch = responses.map((response) => {
      return { id: response.id, patch: { value: response?.value } }
    })

    // Send Application in one-block mutation to update Application + Responses
    applicationSubmitMutation({
      variables: {
        serial: applicationSerial,
        responses: responsesPatch,
      },
    })
  }, [data, responsesError])

  const submit = () => {
    setSubmitted(true)
    setProcessing(true)
  }

  return {
    submitted,
    processing,
    error,
    submit,
  }
}

export default useUpdateApplication
