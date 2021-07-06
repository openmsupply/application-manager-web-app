import { ApplicationViewProps } from '../../types'
import {
  ApplicationDetails,
  ElementState,
  EvaluationOptions,
  ResponseFull,
  ResponsesByCode,
  User,
} from '../../../utils/types'
import { TemplateElement, TemplateElementCategory } from '../../../utils/generated/graphql'
import ApplicationViewWrapper from '../../ApplicationViewWrapper'
import SummaryViewWrapper from '../../SummaryViewWrapper'
import strings from '../constants'
import { evaluateElements } from '../../../utils/helpers/evaluateElements'
import { defaultEvaluatedElement } from '../../../utils/hooks/useLoadApplication'
import { useUserState } from '../../../contexts/UserState'
import { DisplayType, InputResponseField, ListItem, ListLayoutProps } from './types'

// Formatting and Text manipulation
export const getDefaultDisplayFormat = (inputFields: TemplateElement[]) => {
  const displayString = inputFields.reduce(
    (acc: string, { code, title }) => acc + `**${title}**: \${${code}}  \n`,
    ''
  )
  return { title: '', subtitle: '', description: displayString }
}

export const substituteValues = (parameterisedString: string, item: ListItem) => {
  const getValueFromCode = (_: string, $: string, code: string) => item[code]?.value?.text || ''
  return parameterisedString.replace(/(\${)(.*?)(})/gm, getValueFromCode)
}

export const createTextString = (listItems: ListItem[], inputFields: TemplateElement[]) =>
  listItems.reduce(
    (outputAcc, item) =>
      outputAcc +
      inputFields.reduce(
        (innerAcc, field) => innerAcc + `${field.title}: ${item[field.code]?.value?.text}, `,
        ''
      ) +
      '\n',
    ''
  )

// Data validation and state reset
export const resetCurrentResponses = (inputFields: TemplateElement[]) =>
  inputFields.reduce((acc, { code }) => ({ ...acc, [code]: { value: { text: undefined } } }), {})

export const anyInvalidItems = (currentInput: ListItem) =>
  Object.values(currentInput).some((response) => response.isValid === false)

export const anyIncompleteItems = (currentInput: ListItem, inputFields: TemplateElement[]) =>
  Object.values(currentInput).some(
    (response, index) => inputFields[index]?.isRequired !== false && !response.value?.text
  )

export const anyErrorItems = (currentInput: ListItem, inputFields: TemplateElement[]) =>
  anyInvalidItems(currentInput) || anyIncompleteItems(currentInput, inputFields)

// Building elements
export const combineResponses = (
  allResponses: ResponsesByCode,
  currentInputResponses: ListItem
) => {
  const currentResponses = Object.entries(currentInputResponses).reduce(
    (responses, [code, value]) => ({ ...responses, [code]: value?.value }),
    {}
  )
  return { ...allResponses, ...currentResponses }
}

export const buildElements = async (
  fields: TemplateElement[],
  allResponses: ResponsesByCode,
  currentInputResponses: ListItem,
  currentUser: User,
  applicationData: ApplicationDetails
) => {
  const elements = fields.map((field, index) => ({
    ...defaultEvaluatedElement,
    id: index,
    code: field.code,
    pluginCode: field.elementTypePluginCode as string,
    category: field.category as TemplateElementCategory,
    title: field.title as string,
    parameters: field.parameters,
    validationExpression: field?.validation || true,
    validationMessage: field?.validationMessage || '',
    isVisibleExpression: field?.visibilityCondition || true,
    isEditableExpression: field?.isEditable || true,
    isRequiredExpression: field?.isRequired || false,
    // "Dummy" values, but required for element props:
    elementIndex: 0,
    isValid: undefined,
    page: 0,
    sectionIndex: 0,
    helpText: null,
    sectionCode: '0',
  }))
  const evaluationOptions: EvaluationOptions = ['isEditable', 'isVisible', 'isRequired']
  const evaluationObjects = {
    responses: combineResponses(allResponses, currentInputResponses),
    currentUser,
    applicationData,
  }
  const evaluatedElements = await evaluateElements(elements, evaluationOptions, evaluationObjects)
  const outputElements: { [key: string]: ElementState } = {}
  for (let i = 0; i < elements.length; i++) {
    outputElements[elements[i].code] = { ...elements[i], ...evaluatedElements[i] }
  }
  return outputElements
}
