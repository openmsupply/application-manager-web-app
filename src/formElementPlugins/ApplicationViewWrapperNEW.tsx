import React, { useEffect, useState } from 'react'
import { ErrorBoundary, pluginProvider } from '.'
import { ApplicationViewWrapperPropsNEW, PluginComponents, ValidationState } from './types'
import { useApplicationState } from '../contexts/ApplicationState'
import { useUpdateResponseMutation } from '../utils/generated/graphql'
import {
  EvaluatorParameters,
  LooseString,
  ResponseFull,
  ElementPluginParameters,
  ElementPluginParameterValue,
} from '../utils/types'
import { useUserState } from '../contexts/UserState'
import validate from './defaultValidate'
import evaluateExpression from '@openmsupply/expression-evaluator'
import { Form } from 'semantic-ui-react'
import Markdown from '../utils/helpers/semanticReactMarkdown'
import { IQueryNode } from '@openmsupply/expression-evaluator/lib/types'
import strings from '../utils/constants'
import { useFormElementUpdateTracker } from '../contexts/FormElementUpdateTrackerState'

const ApplicationViewWrapper: React.FC<ApplicationViewWrapperPropsNEW> = (props) => {
  const {
    code,
    pluginCode,
    parameters,
    initialValue,
    isVisible,
    isEditable,
    isRequired,
    isValid,
    isStrictPage,
    validationExpression,
    validationMessage,
    currentResponse,
    allResponses,
  } = props

  const [responseMutation] = useUpdateResponseMutation()
  const { setState: setUpdateTrackerState } = useFormElementUpdateTracker()

  const {
    userState: { currentUser },
  } = useUserState()
  const [value, setValue] = useState<any>(initialValue?.text)
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid,
  })
  const [evaluatedParameters, setEvaluatedParameters] = useState({})

  // This value prevents the plugin component from rendering until parameters have been evaluated, otherwise React throws an error when trying to pass an Object in as a prop value
  const [parametersReady, setParametersReady] = useState(false)

  const { ApplicationView, config }: PluginComponents = pluginProvider.getPluginElement(pluginCode)

  const dynamicParameters = config?.dynamicParameters
  const dynamicExpressions =
    dynamicParameters && extractDynamicExpressions(dynamicParameters, parameters)

  // Update dynamic parameters when responses change
  useEffect(() => {
    evaluateDynamicParameters(dynamicExpressions as ElementPluginParameters, {
      objects: { responses: allResponses, currentUser },
      APIfetch: fetch,
    }).then((result: ElementPluginParameters) => {
      setEvaluatedParameters(result)
      setParametersReady(true)
    })
  }, [allResponses])

  useEffect(() => {
    onUpdate(currentResponse?.text)
  }, [currentResponse])

  const onUpdate = async (value: LooseString) => {
    const responses = { thisResponse: value, ...allResponses }
    const newValidationState = await calculateValidationState({
      validationExpression,
      validationMessage,
      isRequired,
      isStrictPage,
      responses,
      evaluationParameters: { objects: { responses, currentUser }, APIfetch: fetch },
    })
    setValidationState(newValidationState)
    return newValidationState
  }

  const onSave = async (jsonValue: ResponseFull) => {
    if (!jsonValue.customValidation) {
      // Validate and Save response -- generic
      const validationResult: ValidationState = await onUpdate(jsonValue.text)
      if (jsonValue.text !== undefined)
        await responseMutation({
          variables: {
            id: currentResponse?.id as number,
            value: jsonValue,
            isValid: validationResult.isValid,
          },
        })
      setUpdateTrackerState({
        type: 'setElementTimestamp',
        timestampType: 'elementUpdatedTimestamp',
      })
    } else {
      // Save response for plugins with internal validation
      const { isValid, validationMessage } = jsonValue.customValidation
      setValidationState({ isValid, validationMessage })
      delete jsonValue.customValidation // Don't want to save this field
      await responseMutation({
        variables: {
          id: currentResponse?.id as number,
          value: jsonValue,
          isValid,
        },
      })
      setUpdateTrackerState({
        type: 'setElementTimestamp',
        timestampType: 'elementUpdatedTimestamp',
      })
    }
  }

  const setIsActive = () => {
    // Tells application state that a plugin field is in focus
    setUpdateTrackerState({
      type: 'setElementTimestamp',
      timestampType: 'elementEnteredTimestamp',
    })
  }

  if (!pluginCode || !isVisible) return null

  const PluginComponent = (
    <ApplicationView
      onUpdate={onUpdate}
      onSave={onSave}
      {...props}
      parameters={{ ...parameters, ...evaluatedParameters }}
      value={value}
      setValue={setValue}
      setIsActive={setIsActive}
      isEditable={isEditable}
      Markdown={Markdown}
      validationState={validationState || { isValid: true }}
      validate={validate}
      getDefaultIndex={getDefaultIndex}
    />
  )

  return (
    <ErrorBoundary pluginCode={pluginCode}>
      <React.Suspense fallback="Loading Plugin">
        {parametersReady && <Form.Field required={isRequired}>{PluginComponent}</Form.Field>}
      </React.Suspense>
    </ErrorBoundary>
  )
}

export default ApplicationViewWrapper

/* 
Allows the default value in template to be either an index or string
value. Number is assumed to be index, else it returns the index of the 
specified value in the options array. Functions is passed as prop to
element plug-ins so can be used by any plugin.
*/
const getDefaultIndex = (defaultOption: string | number, options: string[]) => {
  if (typeof defaultOption === 'number') {
    return defaultOption
  } else return options.indexOf(defaultOption)
}

const extractDynamicExpressions = (fields: string[], parameters: ElementPluginParameters) => {
  const expressionObject: ElementPluginParameters = {}
  fields.forEach((field) => {
    expressionObject[field] = parameters[field]
  })
  return expressionObject
}

const evaluateDynamicParameters = async (
  dynamicExpressions: ElementPluginParameters,
  evaluatorParameters: EvaluatorParameters
) => {
  if (!dynamicExpressions) return {}
  const fields = Object.keys(dynamicExpressions)
  const expressions = Object.values(
    dynamicExpressions
  ).map((expression: ElementPluginParameterValue) =>
    evaluateExpression(expression, evaluatorParameters)
  )
  const evaluatedExpressions: any = await Promise.all(expressions)
  const evaluatedParameters: ElementPluginParameters = {}
  for (let i = 0; i < fields.length; i++) {
    evaluatedParameters[fields[i]] = evaluatedExpressions[i]
  }
  return evaluatedParameters
}

const calculateValidationState = async ({
  validationExpression,
  validationMessage,
  isRequired,
  isStrictPage,
  responses,
  evaluationParameters,
}: {
  validationExpression: IQueryNode | undefined
  validationMessage: string | null | undefined
  isRequired: boolean | undefined
  isStrictPage: boolean | undefined
  responses: any // thisResponse field makes it not "ResponsesByCode"
  evaluationParameters: EvaluatorParameters
}) => {
  const validationResult = validationExpression
    ? await validate(validationExpression, validationMessage as string, evaluationParameters)
    : { isValid: true }
  if (!validationResult.isValid) return validationResult
  if (
    isRequired &&
    isStrictPage &&
    (responses.thisResponse === undefined || responses.thisResponse === null)
  )
    return {
      isValid: false,
      validationMessage: validationMessage || strings.VALIDATION_REQUIRED_ERROR,
    }
  return { isValid: true }
}