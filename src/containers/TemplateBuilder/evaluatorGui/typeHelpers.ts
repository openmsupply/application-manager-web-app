import { EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'
import {
  GetEvaluationType,
  EvaluationType,
  GetTypedEvaluationAsStringType,
  ConvertTypedEvaluationToBaseType,
  Operator,
} from './types'

const parseBuildObject = (evaluation: any, resultEvaluation: EvaluationType) => {
  resultEvaluation.asBuildObject.properties = []

  if (evaluation?.properties) {
    resultEvaluation.asBuildObject.properties = evaluation?.properties.map((property: any) => ({
      key: getTypedEvaluation(property?.key),
      value: getTypedEvaluation(property?.value),
    }))
  }

  return resultEvaluation
}

export const getTypedEvaluation: GetEvaluationType = (evaluation) => {
  const resultEvaluation: EvaluationType = {
    alreadyTyped: true,
    type: 'null',
    asString: 'string',
    asNumber: 0,
    asBoolean: false,
    asObject: {},
    asArray: [],
    asNull: null,
    asOperator: { operator: 'none', children: [] },
    asBuildObject: { properties: [] },
  }

  if (Array.isArray(evaluation)) {
    resultEvaluation.type = 'array'
    evaluation.forEach((evaluation) => {
      resultEvaluation.asArray.push(getTypedEvaluation(evaluation))
    })
    return resultEvaluation
  }
  if (typeof evaluation === 'string') {
    resultEvaluation.type = 'string'
    resultEvaluation.asString = evaluation as string
    return resultEvaluation
  }
  if (typeof evaluation === 'boolean') {
    resultEvaluation.type = 'boolean'
    resultEvaluation.asBoolean = evaluation as boolean
    return resultEvaluation
  }
  if (typeof evaluation === 'number') {
    resultEvaluation.type = 'number'
    resultEvaluation.asNumber = evaluation as number
    return resultEvaluation
  }
  if (evaluation === null || typeof evaluation === 'undefined' || typeof evaluation !== 'object') {
    resultEvaluation.type = 'null'
    return resultEvaluation
  }
  // Must be an object
  if (evaluation.alreadyTyped) return evaluation as EvaluationType

  if (typeof evaluation.operator === 'string') {
    resultEvaluation.type = 'operator'
    resultEvaluation.asOperator.operator = evaluation.operator

    if (evaluation.operator === 'buildObject') {
      return parseBuildObject(evaluation, resultEvaluation)
    }

    if (Array.isArray(evaluation.children)) {
      evaluation.children.forEach((evaluation: any) => {
        resultEvaluation.asOperator.children.push(getTypedEvaluation(evaluation))
      })
      return resultEvaluation
    }
    // Must be plain
    resultEvaluation.type = 'object'
    resultEvaluation.asObject = evaluation
    return resultEvaluation
  }
  // Want to strip of 'value' not sure what is the use for it in current implementation
  if (typeof evaluation.value !== 'undefined') {
    return getTypedEvaluation(evaluation.value)
  }
  // Must be a plain object type
  // Due to current implementation of evaluator (plain object that have 'value' will be treated as not plain objects)
  resultEvaluation.type = 'object'
  resultEvaluation.asObject = evaluation as object
  return resultEvaluation
}

export const getTypedEvaluationAsString: GetTypedEvaluationAsStringType = (evaluation) => {
  const baseEvaluation = convertTypedEvaluationToBaseType(evaluation)
  if (
    (typeof baseEvaluation === 'object' && typeof baseEvaluation !== null) ||
    Array.isArray(baseEvaluation)
  )
    return JSON.stringify(baseEvaluation, null, ' ')
  return String(baseEvaluation)
}

export const convertTypedEvaluationToBaseType: ConvertTypedEvaluationToBaseType = (evaluation) => {
  switch (evaluation.type) {
    case 'string':
      return evaluation.asString
    case 'number':
      return evaluation.asNumber
    case 'boolean':
      return evaluation.asBoolean
    case 'null':
      return null
    case 'object':
      return evaluation.asObject
    case 'array':
      const arrayResult: EvaluatorNode[] = []
      evaluation.asArray.forEach((evaluation) => {
        arrayResult.push(convertTypedEvaluationToBaseType(getTypedEvaluation(evaluation)))
      })
      return arrayResult
    case 'operator':
      if (evaluation.asOperator.operator === 'buildObject') {
        return {
          operator: 'buildObject',
          properties: evaluation.asBuildObject.properties.map((property) => ({
            key: convertTypedEvaluationToBaseType(getTypedEvaluation(property.key)),
            value: convertTypedEvaluationToBaseType(getTypedEvaluation(property.value)),
          })),
        }
      }
      const operatorResult: {
        operator: Operator
        children: EvaluatorNode[]
      } = {
        operator: evaluation.asOperator.operator,
        children: [],
      }
      evaluation.asOperator.children.forEach((evaluation) => {
        operatorResult.children.push(
          convertTypedEvaluationToBaseType(getTypedEvaluation(evaluation))
        )
      })
      return operatorResult
    default:
      return ''
  }
}
