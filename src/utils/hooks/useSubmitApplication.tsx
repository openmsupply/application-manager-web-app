import { useState } from 'react'
import { TemplateElementCategory, useUpdateApplicationMutation } from '../generated/graphql'
import { FullStructure, ResponseFull, UseGetApplicationProps } from '../types'

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

  const submitFromStructure = async (structure: FullStructure) => {
    const elements = Object.values(structure.elementsById || {}).filter(
      (element) => element.element.category === TemplateElementCategory.Question
    )
    const responsesPatch = elements.map(({ latestApplicationResponse }) => {
      return {
        id: latestApplicationResponse.id,
        patch: { value: latestApplicationResponse.value || null },
      }
    })

    return await applicationSubmitMutation({
      variables: {
        serial: serialNumber,
        responses: responsesPatch,
      },
    })
  }
  // TODO: Remove this
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
    submitFromStructure,
  }
}

export default useSubmitApplication
