import {
  EvaluatorNode,
  IParameters,
  OperatorNode,
} from '@openmsupply/expression-evaluator/lib/types'
import React from 'react'

export type Operator = OperatorNode['operator'] | 'none' | 'buildObject'

export type ComponentLibraryType = {
  TextInput: React.FC<{ text: string; setText: (text: string) => void; title?: string }>
  NumberInput: React.FC<{
    number: number
    setNumber: (number: number) => void
    title?: string
  }>
  Checkbox: React.FC<{
    checked: boolean
    setChecked: (checked: boolean) => void
    title?: string
  }>
  ObjectInput: React.FC<{
    object: object
    setObject: (object: object) => void
  }>
  Label: React.FC<{ title: string }>
  Add: React.FC<{ onClick: () => void; title?: string }>
  Remove: React.FC<{ onClick: () => void }>
  FlexRow: React.FC
  FlexColumn: React.FC
  Step: React.FC
  OperatorContainer: React.FC
  Selector: React.FC<{
    selections: string[]
    selected: string
    setSelected: (selected: string) => void
    title: string
  }>
  Error: React.FC<{ error: string; info: string }>
}

export type GuiType = {
  selector: string
  default: EvaluationType
  match: (evaluation: EvaluationType) => boolean
  render: RenderTypedEvaluationType
}
export type GuisType = GuiType[]

export type PureArrayType = (props: {
  newValue: EvaluationType
  selector: string
  operator: string
}) => GuiType

export type RenderTypedEvaluationType = (
  evaluation: EvaluationType,
  setEvaluation: (evaluation: EvaluationType) => void,
  ComponentLibrary: ComponentLibraryType,
  evaluatorParameters: IParameters
) => React.ReactNode

export type EvaluationVariations =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'null'
  | 'object'
  | 'operator'

export type OperatorType = {
  operator: Operator
  children: EvaluationType[]
}

export type EvaluationType = {
  alreadyTyped: boolean
  type: EvaluationVariations
  asString: string
  asNumber: number
  asBoolean: boolean
  asObject: object
  asArray: EvaluationType[]
  asNull: null
  asOperator: OperatorType
  asBuildObject: {
    properties: { key: EvaluationType; value: EvaluationType }[]
  }
}

export type GetEvaluationType = (evaluation: any) => EvaluationType

export type RenderEvaluationElementType = (
  evaluation: any,
  setEvaluation: (evaluation: EvaluationType) => void,
  ComponentLibrary: ComponentLibraryType,
  evaluatorParameters: IParameters
) => React.ReactNode

export type ParseAndRenderEvaluationType = (
  evaluation: string,
  setEvaluation: (evaluation: string) => void,
  ComponentLibrary: ComponentLibraryType,
  evaluatorParameters: IParameters
) => React.ReactNode

export type GetTypedEvaluationAsStringType = (evaluation: EvaluationType) => string

export type ConvertTypedEvaluationToBaseType = (evaluation: EvaluationType) => EvaluatorNode

export type RenderArrayControlType = (props: {
  evaluation: EvaluationType
  key: string
  offset: number
  title?: string
  setEvaluation: (evaluation: EvaluationType) => void
  newValue: EvaluationType
  ComponentLibrary: ComponentLibraryType
  evaluatorParameters: IParameters
}) => React.ReactNode

export type RenderDynamicParametersType = (props: {
  header: string
  parameterNameHeader: string
  parameterValueHeader: string
  parametersOffset: number
  defaultParameterName: EvaluationType
  defaultParameterValue: EvaluationType
  setEvaluation: (evaluation: EvaluationType) => void
  evaluation: EvaluationType
  ComponentLibrary: ComponentLibraryType
  evaluatorParameters: IParameters
}) => React.ReactNode

export type AddToArrayType = (evaluation: EvaluationType, value: EvaluationType) => EvaluationType

export type RemoveFromArrayType = (evaluation: EvaluationType, index: number) => EvaluationType
export type SetInArrayType = (
  evaluation: EvaluationType,
  index: number,
  value: EvaluationType
) => EvaluationType

export type RenderSingleChildType = (
  evaluation: EvaluationType,
  index: number,
  setEvaluation: (evaluation: EvaluationType) => void,
  ComponentLibrary: ComponentLibraryType,
  evaluatorParameters: IParameters
) => React.ReactNode
