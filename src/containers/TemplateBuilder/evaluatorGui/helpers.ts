import cloneDeep from 'clone-deep'
import { AddToArrayType, RemoveFromArrayType, SetInArrayType } from './types'
export const addToArray: AddToArrayType = (evalution, value) => {
  const newEvaluation = cloneDeep(evalution)
  if (newEvaluation.type === 'array') newEvaluation.asArray.push(value)
  if (newEvaluation.type === 'operator') newEvaluation.asOperator.children.push(value)
  return newEvaluation
}

export const removeFromArray: RemoveFromArrayType = (evalution, index) => {
  const newEvaluation = cloneDeep(evalution)
  if (newEvaluation.type === 'array') newEvaluation.asArray.splice(index, 1)
  if (newEvaluation.type === 'operator') newEvaluation.asOperator.children.splice(index, 1)
  return newEvaluation
}

export const setInArray: SetInArrayType = (evalution, index, value) => {
  const newEvaluation = cloneDeep(evalution)
  if (newEvaluation.type === 'array') newEvaluation.asArray[index] = value
  if (newEvaluation.type === 'operator') newEvaluation.asOperator.children[index] = value
  return newEvaluation
}
