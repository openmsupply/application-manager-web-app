import evaluateExpression, { isEvaluationExpression } from '@openmsupply/expression-evaluator'
import config from '../../config.json'
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
  responseObject?: ResponsesByCode
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

type EvaluatElement = (
  element: ElementForEvaluation,
  evaluationOptions: EvaluationOptions,
  objects: EvaluationObject
) => Promise<PartialEvaluatedElement>

const evaluateSingleElement: EvaluatElement = async (
  element,
  evaluationOptions,
  { responseObject, currentUser, applicationData }
) => {
  const evaluationParameters = {
    objects: {
      responses: { ...responseObject, thisResponse: responseObject?.[element.code]?.text },
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
  }

  const evaluations = evaluationOptions.map((evaluationResultKey) => {
    const elementExpressionKey = evaluationMapping[evaluationResultKey]
    const evaluationExpression = element[elementExpressionKey]

    return evaluateSingleExpression(evaluationExpression, evaluationResultKey)
  })

  await Promise.all(evaluations)

  return evaluatedElement
}
