import evaluateExpression, { isEvaluationExpression } from '@openmsupply/expression-evaluator'
import config from '../../config'
import {
  EvaluatedElement,
  ResponsesByCode,
  User,
  ApplicationDetails,
  ElementForEvaluation,
  EvaluationOptions,
  EvaluatorNode,
} from '../types'
const graphQLEndpoint = config.serverGraphQL

type PartialEvaluatedElement = Partial<EvaluatedElement>
type EvaluationObject = {
  responses?: ResponsesByCode
  currentUser?: User | null
  applicationData?: ApplicationDetails
}

type EvaluateElements = (
  elements: ElementForEvaluation[],
  evaluationOptions: EvaluationOptions,
  objects: EvaluationObject
) => Promise<PartialEvaluatedElement[]>

const evaluationMapping: { [resultKey in keyof EvaluatedElement]: keyof ElementForEvaluation } = {
  isEditable: 'isEditableExpression',
  isRequired: 'isRequiredExpression',
  isVisible: 'isVisibleExpression',
  isValid: 'validationExpression',
  defaultValue: 'defaultValueExpression',
}

export const evaluateElements: EvaluateElements = async (elements, evaluationOptions, objects) => {
  const elementPromiseArray: Promise<PartialEvaluatedElement>[] = []
  elements.forEach((element) => {
    elementPromiseArray.push(evaluateSingleElement(element, evaluationOptions, objects))
  })
  return await Promise.all<PartialEvaluatedElement>(elementPromiseArray)
}

type EvaluateElement = (
  element: ElementForEvaluation,
  evaluationOptions: EvaluationOptions,
  objects: EvaluationObject
) => Promise<PartialEvaluatedElement>

const evaluateSingleElement: EvaluateElement = async (
  element,
  evaluationOptions,
  { responses, currentUser, applicationData }
) => {
  const evaluationParameters = {
    objects: {
      responses: { ...responses, thisResponse: responses?.[element.code]?.text },
      currentUser,
      applicationData,
    },
    APIfetch: fetch,
    graphQLConnection: { fetch: fetch.bind(window), endpoint: graphQLEndpoint },
  }

  const evaluatedElement: PartialEvaluatedElement = {}

  const evaluateSingleExpression = async (
    expressionOrValue: EvaluatorNode,
    elementResultKey: keyof EvaluatedElement
  ) => {
    try {
      evaluatedElement[elementResultKey] = isEvaluationExpression(expressionOrValue)
        ? await evaluateExpression(expressionOrValue, evaluationParameters)
        : expressionOrValue
    } catch (e) {
      console.log(e, expressionOrValue)
    }

    console.log(expressionOrValue, evaluatedElement[elementResultKey])
  }

  const evaluations = evaluationOptions.map((evaluationResultKey) => {
    const elementExpressionKey = evaluationMapping[evaluationResultKey]
    const evaluationExpression = element[elementExpressionKey]
    console.log(applicationData)

    return evaluateSingleExpression(evaluationExpression, evaluationResultKey)
  })

  await Promise.all(evaluations)

  return evaluatedElement
}
