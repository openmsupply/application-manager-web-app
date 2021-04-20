import { useState } from 'react'
import {
  ApplicationResponseStatus,
  TemplateElementCategory,
  useUpdateApplicationMutation,
} from '../generated/graphql'
import { FullStructure, UseGetApplicationProps } from '../types'

const useSubmitApplication = ({ serialNumber }: UseGetApplicationProps) => {
  const [error, setError] = useState('')

  const [applicationSubmitMutation] = useUpdateApplicationMutation({
    onError: (submissionError) => setError(submissionError.message),
  })

  const submit = async (structure: FullStructure) => {
    const elements = Object.values(structure.elementsById || {}).filter(
      (element) => element.element.category === TemplateElementCategory.Question
    )
    const responsesPatch = elements.map(({ latestApplicationResponse }) => {
      return {
        id: latestApplicationResponse.id,
        patch: {
          value: latestApplicationResponse.value || null,
          status: ApplicationResponseStatus.Submitted,
        },
      }
    })

    const result = await applicationSubmitMutation({
      variables: {
        serial: serialNumber,
        responses: responsesPatch,
      },
    })
    if (result.errors) throw new Error(result.errors.toString())
    return result
  }

  return {
    error,
    submit,
  }
}

export default useSubmitApplication
