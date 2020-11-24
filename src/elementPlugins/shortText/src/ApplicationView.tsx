import React, { useState, useEffect } from 'react'
import { Form } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import config from '../pluginConfig.json'
import evaluateExpression from '@openmsupply/expression-evaluator'

const dynamicFieldNames = config.dynamicParameterFields

const evaluateDynamicFields = async (parameters: any) => {
  const dynamicFields = Object.keys(parameters).filter((key: any) => {
    key in dynamicFieldNames
  })
  console.log('dynamicFields', dynamicFields)
  const dynamicExpressions = dynamicFields.map((field: any) => {
    return parameters[field]
  })
  console.log('dynamicExpressions', dynamicExpressions)

  const promiseArray: Promise<any>[] = []
  dynamicExpressions.forEach((exp: any) => {
    promiseArray.push(evaluateExpression(exp))
  })
  const evaluatedParameters = await Promise.all(promiseArray)
  return zipArraysToObject(dynamicFields, evaluatedParameters)
}

// Build an object from an array of field names and an array of values
const zipArraysToObject = (variableNames: any[], variableValues: any[]) => {
  const createdObject: any = {}
  variableNames.map((name, index) => {
    createdObject[name] = variableValues[index]
  })
  return createdObject
}

const ApplicationView: React.FC<ApplicationViewProps> = ({
  templateElement,
  onUpdate,
  initialValue,
  isEditable,
  currentResponse,
  validationState,
  onSave,
}) => {
  const [value, setValue] = useState(initialValue?.text)
  const [dynamicValues, setDynamicValues] = useState({})
  const { placeholder, maskedInput, label } = templateElement?.parameters

  useEffect(() => {
    onUpdate(value)
  }, [])

  evaluateDynamicFields(templateElement.parameters).then((res) => console.log('Evaluation:', res))

  function handleChange(e: any) {
    onUpdate(e.target.value)
    setValue(e.target.value)
  }

  function handleLoseFocus(e: any) {
    // TO-DO if password (i.e 'maskedInput'), do HASH on password before sending value
    onSave({ text: value })
  }

  return (
    <>
      <Form.Input
        fluid
        label={label}
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
