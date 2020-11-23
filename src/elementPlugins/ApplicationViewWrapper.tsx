import React, { useEffect, useState } from 'react'
import { ErrorBoundary, pluginProvider } from './'
import { ApplicationViewWrapperProps, PluginComponents } from './types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import { useUpdateResponseMutation } from '../utils/generated/graphql'
import { ResponseFull } from '../utils/types'

const ApplicationViewWrapper: React.FC<ApplicationViewWrapperProps> = (props) => {
  const {
    templateElement,
    isVisible,
    isEditable,
    isRequired,
    currentResponse,
    allResponses,
  } = props

  const { elementTypePluginCode: pluginCode } = templateElement
  const { validation: validationExpression, validationMessage } = templateElement?.parameters

  const [responseMutation] = useUpdateResponseMutation()
  const [parametersEvaluated, setParametersEvaluated] = useState({})
  const [pluginMethods, setPluginMethods] = useState({
    validate: (validationExpress: any, validationMessage: any, evaluator: any) =>
      console.log('notLoaded'),
  })
  const [validationState, setValidationState] = useState<any>({})

  useEffect(() => {
    if (!pluginCode) return
    // TODO use generic or plugin specific
    setPluginMethods({
      validate: defaultValidate,
    })
  }, [])

  useEffect(() => {
    const parameters = templateElement.parameters
    const parametersEvaluated = {}
    for (const key in parameters) {
      console.log('Parameter', key, parameters[key])
    }
  }, [allResponses])

  const onUpdate = async (value: string | null | undefined) => {
    const responses = { thisResponse: value, ...allResponses }

    if (!validationExpression || value === undefined) {
      setValidationState({ isValid: true })
      return { isValid: true }
    }

    const evaluator = async (expression: any) => {
      return await evaluateExpression(expression, { objects: [responses], APIfetch: fetch })
    }
    const validationResult = await pluginMethods.validate(
      validationExpression,
      validationMessage,
      evaluator
    )
    setValidationState(validationResult)

    return validationResult
  }

  const onSave = async (jsonValue: ResponseFull) => {
    const validationResult: any = await onUpdate(jsonValue.text)
    console.log('On Save', {
      variables: {
        id: currentResponse?.id as number,
        value: jsonValue,
        isValid: validationResult.isValid,
      },
    })
    responseMutation({
      variables: {
        id: currentResponse?.id as number,
        value: jsonValue,
        isValid: validationResult.isValid,
      },
    })
  }

  if (!pluginCode || !isVisible) return null

  const newProps = { onUpdate, onSave, validationState, ...props }

  const { ApplicationView }: PluginComponents = pluginProvider.getPluginElement(pluginCode)

  return (
    <ErrorBoundary pluginCode={pluginCode}>
      <React.Suspense fallback="Loading Plugin">{<ApplicationView {...newProps} />}</React.Suspense>
    </ErrorBoundary>
  )
}

const defaultValidate = async (validationExpress: any, validationMessage: any, evaluator: any) => {
  if (!validationExpress) return { isValid: true }
  const isValid = await evaluator(validationExpress)
  if (isValid) return { isValid }
  return { isValid, validationMessage }
}

export default ApplicationViewWrapper
