import evaluateExpression from '@openmsupply/expression-evaluator'
import { IQueryNode } from '@openmsupply/expression-evaluator/lib/types'
import { ValidationState } from './types'
import { EvaluatorParameters } from '../utils/types'

const defaultValidate = async (
  validationExpress: IQueryNode,
  validationMessage: string,
  evaluatorParameters: EvaluatorParameters
): Promise<ValidationState> => {
  if (!validationExpress || evaluatorParameters?.objects?.responses.thisResponse === undefined)
    return { isValid: true }
  const isValid = (await evaluateExpression(validationExpress, evaluatorParameters)) as boolean
  if (isValid) return { isValid }
  return { isValid, validationMessage }
}

export default defaultValidate
