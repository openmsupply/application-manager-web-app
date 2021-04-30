import React, { useEffect, useState } from 'react'
import { ErrorBoundary, pluginProvider } from '.'
import { ApplicationViewWrapperProps, PluginComponents, ValidationState } from './types'
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
import { Form, Icon, Loader } from 'semantic-ui-react'
import Markdown from '../utils/helpers/semanticReactMarkdown'
import { IQueryNode } from '@openmsupply/expression-evaluator/lib/types'
import strings from '../utils/constants'
import { useFormElementUpdateTracker } from '../contexts/FormElementUpdateTrackerState'
import messages from '../utils/messages'
import globalConfig from '../config'

const graphQLEndpoint = globalConfig.serverGraphQL
const restEndpoint = globalConfig.serverREST

const ApplicationViewWrapper: React.FC<ApplicationViewWrapperProps> = (props) => {
  const {
    element,
    isStrictPage,
    changesRequired,
    currentResponse,
    allResponses,
    applicationData,
  } = props

  const {
    code,
    pluginCode,
    parameters,
    isVisible,
    isEditable,
    isRequired,
    validationExpression,
    validationMessage,
  } = element

  const isValid = currentResponse?.isValid || true

  const [responseMutation] = useUpdateResponseMutation()
  const { setState: setUpdateTrackerState } = useFormElementUpdateTracker()

  const {
    userState: { currentUser },
  } = useUserState()
  const [value, setValue] = useState<any>(currentResponse?.text)
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
      objects: {
        responses: allResponses,
        currentUser,
        applicationData,
        endpoints: { restEndpoint, graphQLEndpoint },
      },
      APIfetch: fetch,
      graphQLConnection: { fetch: fetch.bind(window), endpoint: graphQLEndpoint },
    }).then((result: ElementPluginParameters) => {
      setEvaluatedParameters(result)
      setParametersReady(true)
    })
  }, [allResponses])

  useEffect(() => {
    onUpdate(currentResponse?.text)
  }, [currentResponse, isStrictPage])

  const onUpdate = async (value: LooseString) => {
    const responses = { thisResponse: value, ...allResponses }
    const newValidationState = await calculateValidationState({
      validationExpression,
      validationMessage,
      isRequired,
      isStrictPage,
      responses,
      evaluationParameters: {
        objects: { responses, currentUser, applicationData },
        APIfetch: fetch,
        graphQLConnection: { fetch: fetch.bind(window), endpoint: graphQLEndpoint },
      },
      currentResponse,
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
        type: 'setElementUpdated',
        textValue: jsonValue?.text || '',
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
        type: 'setElementUpdated',
        textValue: jsonValue?.text || '',
      })
    }
  }

  const setIsActive = () => {
    // Tells application state that a plugin field is in focus
    setUpdateTrackerState({
      type: 'setElementEntered',
      textValue: value || '',
    })
  }

  if (!pluginCode || !isVisible) return null

  const PluginComponent = (
    <ApplicationView
      onUpdate={onUpdate}
      onSave={onSave}
      initialValue={currentResponse}
      {...props}
      {...element}
      parameters={{ ...parameters, ...evaluatedParameters }}
      value={value}
      setValue={setValue}
      setIsActive={setIsActive}
      Markdown={Markdown}
      validationState={validationState || { isValid: true }}
      validate={validate}
      getDefaultIndex={getDefaultIndex}
    />
  )

  const getResponseAndBorder = () => {
    if (!changesRequired) return null
    const { isChangeRequest, isChanged } = changesRequired
    const isValid = validationState ? (validationState.isValid as boolean) : true
    const displayResponseWarning = isChangeRequest || (isChanged && isValid)
    return (
      <div
        style={{
          border: displayResponseWarning ? 'solid 1px' : 'transparent',
          borderColor: isChangeRequest ? (isChanged ? 'black' : 'red') : 'blue',
          borderRadius: 7,
          padding: displayResponseWarning ? 4 : 5,
          margin: 5,
        }}
      >
        {parametersReady ? (
          <Form.Field required={isRequired}>{PluginComponent}</Form.Field>
        ) : (
          <Loader active inline />
        )}
        <ChangesToResponseWarning {...changesRequired} isValid={isValid} />
      </div>
    )
  }

  return (
    <ErrorBoundary pluginCode={pluginCode}>
      <React.Suspense fallback="Loading Plugin">
        {changesRequired ? (
          getResponseAndBorder()
        ) : parametersReady ? (
          <Form.Field required={isRequired}>{PluginComponent}</Form.Field>
        ) : (
          <Loader active inline />
        )}
      </React.Suspense>
    </ErrorBoundary>
  )
}

interface ChangesToResponseWarningProps {
  isChangeRequest: boolean
  isChanged: boolean
  reviewerComment: string
  isValid: boolean
}

const ChangesToResponseWarning: React.FC<ChangesToResponseWarningProps> = ({
  isChangeRequest,
  isChanged,
  reviewerComment,
  isValid,
}) => {
  const displayResponseWarning = isChangeRequest || (isChanged && isValid)
  return (
    <div
      style={{
        color: isChangeRequest && isChanged && isValid ? 'grey' : 'red',
        visibility: displayResponseWarning ? 'visible' : 'hidden',
      }}
    >
      <Icon
        name={
          isChangeRequest
            ? isChanged
              ? 'comment alternate outline'
              : 'exclamation circle'
            : 'info circle'
        }
        color={isChangeRequest ? (isChanged ? 'grey' : 'red') : 'blue'}
      />
      {isChangeRequest ? reviewerComment : messages.APPLICATION_OTHER_CHANGES_MADE}
    </div>
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

export const extractDynamicExpressions = (
  fields: string[],
  parameters: ElementPluginParameters
) => {
  const expressionObject: ElementPluginParameters = {}
  fields.forEach((field) => {
    expressionObject[field] = parameters[field]
  })
  return expressionObject
}

export const evaluateDynamicParameters = async (
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
  currentResponse,
}: {
  validationExpression: IQueryNode | undefined
  validationMessage: string | null | undefined
  isRequired: boolean | undefined
  isStrictPage: boolean | undefined
  responses: any // thisResponse field makes it not "ResponsesByCode"
  evaluationParameters: EvaluatorParameters
  currentResponse: ResponseFull | null
}) => {
  const validationResult = validationExpression
    ? await validate(validationExpression, validationMessage as string, evaluationParameters)
    : { isValid: true }

  if (!validationResult.isValid && currentResponse?.text !== undefined) return validationResult
  // !responses.thisResponse, check for null, undefined, empty string
  if (isRequired && isStrictPage && !responses?.thisResponse)
    return {
      isValid: false,
      validationMessage: validationMessage || strings.VALIDATION_REQUIRED_ERROR,
    }
  return { isValid: true }
}
