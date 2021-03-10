import { useState } from 'react'
import { useUpdateApplicationMutation } from '../generated/graphql'
import { ResponseFull, UseGetApplicationProps } from '../types'

const useSubmitApplication = ({ serialNumber }: UseGetApplicationProps) => {
  const [submitted, setSubmitted] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const [applicationSubmitMutation] = useUpdateApplicationMutation({
    onCompleted: () => {
      setProcessing(false)
      setSubmitted(true)
    },
    onError: (submissionError) => {
      setProcessing(false)
      setError(submissionError.message)
    },
  })

  const submit = async (responses: ResponseFull[]) => {
    setProcessing(true)
    const responsesPatch = responses.map(({ id, ...response }) => {
      return { id, patch: { value: response } }
    })

    // Send Application in one-block mutation to update Application + Responses
    await applicationSubmitMutation({
      variables: {
        serial: serialNumber,
        responses: responsesPatch,
      },
    })
  }

  return {
    submitted,
    processing,
    error,
    submit,
  }
}

export default useSubmitApplication
