import React from 'react'
import { addToArray, removeFromArray, setInArray } from './helpers'
import { renderEvaluationElement } from './renderEvaluation'
import { getTypedEvaluation } from './typeHelpers'
import {
  EvaluationType,
  PureArrayType,
  RenderArrayControlType,
  RenderDynamicParametersType,
  RenderSingleChildType,
} from './types'

const insertInChildrenMutating = (
  evaluation: EvaluationType,
  index: number,
  value: EvaluationType
) => {
  evaluation.asOperator.children.splice(index, 0, value)
}

export const renderDynamicParameters: RenderDynamicParametersType = ({
  header,
  parametersOffset,
  defaultParameterName,
  parameterValueHeader,
  parameterNameHeader,
  defaultParameterValue,
  setEvaluation,
  evaluation,
  ComponentLibrary,
  evaluatorParameters,
}) => {
  const paramaterValueOffset = parametersOffset + 1
  const parameterNamesChild = evaluation.asOperator.children[parametersOffset]
  const parameterNames = getTypedEvaluation(parameterNamesChild)
  const previousParameterNamesLength = parameterNames.asOperator.children.length
  const newPramaterValueIndex = previousParameterNamesLength + paramaterValueOffset

  return (
    <>
      <ComponentLibrary.Add
        title={header}
        key="parametersHeader"
        onClick={() => {
          const newParameterNames = addToArray(parameterNames, defaultParameterName)
          const newEvaluation = setInArray(evaluation, parametersOffset, newParameterNames)
          insertInChildrenMutating(newEvaluation, newPramaterValueIndex, defaultParameterValue)
          setEvaluation(newEvaluation)
        }}
      />

      {parameterNames.asArray.map((queryNameKey, index) => {
        return (
          <ComponentLibrary.OperatorContainer key={index}>
            <ComponentLibrary.FlexRow>
              <ComponentLibrary.Remove
                onClick={() => {
                  const newParameterNames = removeFromArray(parameterNames, index)
                  const newEvaluation = setInArray(evaluation, parametersOffset, newParameterNames)
                  setEvaluation(removeFromArray(newEvaluation, index + paramaterValueOffset))
                }}
              />
              <ComponentLibrary.FlexColumn>
                <ComponentLibrary.TextInput
                  title={parameterNameHeader}
                  key="parameterName"
                  text={queryNameKey.asString}
                  setText={(newParameterName) => {
                    const newParameterNames = setInArray(
                      parameterNames,
                      index,
                      getTypedEvaluation(newParameterName)
                    )
                    setEvaluation(setInArray(evaluation, parametersOffset, newParameterNames))
                  }}
                />
                <ComponentLibrary.Label key="parameterValueTitle" title={parameterValueHeader} />
                {renderEvaluationElement(
                  evaluation.asOperator.children[index + paramaterValueOffset],
                  (newParameterValue) =>
                    setEvaluation(
                      setInArray(evaluation, index + paramaterValueOffset, newParameterValue)
                    ),
                  ComponentLibrary,
                  evaluatorParameters
                )}
              </ComponentLibrary.FlexColumn>
            </ComponentLibrary.FlexRow>
          </ComponentLibrary.OperatorContainer>
        )
      })}
    </>
  )
}

export const renderArrayControl: RenderArrayControlType = ({
  evaluation,
  key,
  offset,
  setEvaluation,
  newValue,
  title = '',
  ComponentLibrary,
  evaluatorParameters,
}) => {
  const isRootArray = evaluation.type === 'array'
  const array = isRootArray ? evaluation.asArray : evaluation.asOperator.children
  return (
    <React.Fragment key={key}>
      <ComponentLibrary.FlexRow>
        <ComponentLibrary.Add
          title={title}
          onClick={() => setEvaluation(addToArray(evaluation, newValue))}
        />
      </ComponentLibrary.FlexRow>
      <ComponentLibrary.FlexColumn>
        {array.map((childEvaluation, index) => {
          if (index < offset) return null
          return (
            <ComponentLibrary.FlexRow key={index}>
              <ComponentLibrary.Remove
                key="removeButton"
                onClick={() => setEvaluation(removeFromArray(evaluation, index))}
              />
              {renderEvaluationElement(
                childEvaluation,
                (newChildEvaluation) =>
                  setEvaluation(setInArray(evaluation, index, newChildEvaluation)),
                ComponentLibrary,
                evaluatorParameters
              )}
            </ComponentLibrary.FlexRow>
          )
        })}
      </ComponentLibrary.FlexColumn>
    </React.Fragment>
  )
}

export const pureArray: PureArrayType = ({ newValue, selector, operator }) => ({
  selector: selector,
  default: getTypedEvaluation({ operator: operator, children: [newValue] }),
  match: (typedEvaluation) =>
    typedEvaluation.type === 'operator' && typedEvaluation.asOperator.operator === operator,
  render: (evaluation, setEvaluation, ComponentLibrary, evaluatorParameters) =>
    renderArrayControl({
      title: 'Elements',
      key: selector,
      evaluation,
      offset: 0,
      setEvaluation,
      newValue,
      ComponentLibrary,
      evaluatorParameters,
    }),
})

export const renderSingleChild: RenderSingleChildType = (
  evaluation,
  index,
  setEvaluation,
  ComponentLibrary,
  evaluatorParameters
) =>
  renderEvaluationElement(
    getTypedEvaluation(evaluation.asOperator.children[index]),
    (newChildEvaluation) => setEvaluation(setInArray(evaluation, index, newChildEvaluation)),
    ComponentLibrary,
    evaluatorParameters
  )
