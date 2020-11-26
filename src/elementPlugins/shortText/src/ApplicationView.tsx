import React, { useState, useEffect } from 'react'
import { Form } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import config from '../pluginConfig.json'
import evaluateExpression from '@openmsupply/expression-evaluator'

const dynamicFieldNames = config.dynamicParameterFields

const evaluateDynamicFields = async (parameters: any, objects: {}[]) => {
  const dynamicExpressions = dynamicFieldNames.map((field: any) => {
    return parameters[field]
  })

  const promiseArray: Promise<any>[] = []
  dynamicExpressions.forEach((exp: any) => {
    promiseArray.push(evaluateExpression(exp, { objects: objects }))
  })
  const evaluatedParameters = await Promise.all(promiseArray)
  return zipArraysToObject(dynamicFieldNames, evaluatedParameters)
}

// Build an object from an array of field names and an array of values
const zipArraysToObject = (variableNames: any[], variableValues: any[]) => {
  const zippedObject: any = {}
  variableNames.map((name, index) => {
    zippedObject[name] = variableValues[index]
  })
  return zippedObject
}

const ApplicationView: React.FC<ApplicationViewProps> = ({
  templateElement,
  onUpdate,
  initialValue,
  isEditable,
  currentResponse,
  validationState,
  onSave,
  allResponses,
  allResponsesFull,
}) => {
  const [value, setValue] = useState(initialValue?.text)
  const [dynamicValues, setDynamicValues] = useState({})
  const { placeholder, maskedInput, label } = templateElement?.parameters
  const [evaluatedParams, setEvaluatedParams] = useState<any>({})

  console.log('allResponsesFull', allResponsesFull)

  useEffect(() => {
    onUpdate(value)
    evaluateDynamicFields(templateElement.parameters, [allResponsesFull]).then((result) =>
      setEvaluatedParams(result)
    )
  }, [])

  function handleChange(e: any) {
    onUpdate(e.target.value)
    setValue(e.target.value)
  }

  function handleLoseFocus(e: any) {
    // TO-DO if password (i.e 'maskedInput'), do HASH on password before sending value
    onSave({ text: value })
    evaluateDynamicFields(templateElement.parameters, [allResponsesFull]).then((result) =>
      setEvaluatedParams(result)
    )
  }

  return (
    <>
      <Form.Input
        fluid
        label={evaluatedParams.label}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleLoseFocus}
        value={value}
        disabled={!isEditable}
        type={maskedInput ? 'password' : undefined}
        error={
          !validationState.isValid && currentResponse?.value?.text
            ? {
                content: validationState?.validationMessage,
                pointing: 'above',
              }
            : null
        }
      />
    </>
  )
}

export default ApplicationView
