import { IQueryNode } from '@openmsupply/expression-evaluator/lib/types'
import { ReviewResponse, TemplateElement } from '../utils/generated/graphql'
import { ElementState, ElementStateNEW, ResponseFull, ResponsesByCode } from '../utils/types'

interface OnUpdateApplicationView {
  (updateObject: { value?: any; isValid: boolean | undefined }): void
}

type BasicObject = {
  [key: string]: any
}

interface ApplicationViewWrapperProps {
  code: string
  pluginCode: string // TODO: Create type OR use existing from graphql
  isVisible: boolean
  isEditable: boolean
  isRequired: boolean
  parameters: any // TODO: Create type for existing pre-defined types for parameters (TemplateElement)
  validationExpression: IQueryNode
  validationMessage: string | null
  allResponses: ResponsesByCode
  currentResponse: ResponseFull | null
  // applicationState,
  // graphQLclient
  initialValue: any // Could be a primative or an object with any shape
  forceValidation?: boolean // Run validation on formElement on load - usualy would run only onChange events
}

interface ApplicationViewWrapperPropsNEW {
  // code: string
  element: ElementStateNEW
  // pluginCode: string // TODO: Create type OR use existing from graphql
  // isVisible: boolean
  // isEditable: boolean
  // isRequired: boolean
  // isValid: boolean
  isStrictPage: boolean | undefined
  changesRequired?: {
    isChangeRequest: boolean
    isChanged: boolean
    reviewerComment: string
  }
  // // parameters: any // TODO: Create type for existing pre-defined types for parameters (TemplateElement)
  // validationExpression: IQueryNode
  // validationMessage: string | null
  allResponses: ResponsesByCode
  currentResponse: ResponseFull | null
  currentReview?: ReviewResponse
  // applicationState,
  // graphQLclient
  // initialValue: any // Could be a primative or an object with any shape
}

type ValidationState = {
  isValid: boolean | undefined | null
  validationMessage?: string | undefined
}

interface ApplicationViewProps extends ApplicationViewWrapperProps {
  onUpdate: Function
  onSave: Function
  value: string // TODO: Change to allow object with any shape
  setValue: (text: string) => void // TO update the value on the ApplicationViewWrapper
  setIsActive: () => void
  validationState: ValidationState
  Markdown: any
  getDefaultIndex: Function
  validate: Function
}

interface SummaryViewProps {
  parameters: BasicObject
  response: ResponseFull | null
  Markdown: any
  DefaultSummaryView: React.FC
}

interface SummaryViewWrapperProps {
  element: ElementState
  response: ResponseFull | null
  allResponses: ResponsesByCode
}
interface SummaryViewWrapperPropsNEW {
  element: ElementStateNEW
  response: ResponseFull | null
  allResponses: ResponsesByCode
  displayTitle?: boolean
}

interface OnUpdateTemplateWrapperView {
  (updateObject: { [key: string]: any }): void
}

interface TemplateViewWrapperProps {
  templateElement: TemplateElement
  onUpdate: OnUpdateTemplateWrapperView
}

interface OnUpdateTemplateView {
  (parameters: any): void
}

interface TemplateViewProps {
  parameters: any
  onUpdate: OnUpdateTemplateView
}

interface PluginConfig {
  isCore?: boolean
  code: string
  folderName: string
  displayName: string
  dynamicParameters?: string[]
  category: 'Input' | 'Informative'
}

interface PluginManifest {
  [key: string]: PluginConfig
}

interface PluginComponents {
  ApplicationView: React.FunctionComponent<ApplicationViewProps>
  SummaryView: React.FunctionComponent<SummaryViewProps>
  TemplateView: React.FunctionComponent<TemplateViewProps>
  config?: PluginConfig
}

interface Plugins {
  [key: string]: PluginComponents
}

export {
  OnUpdateApplicationView,
  OnUpdateTemplateWrapperView,
  TemplateViewProps,
  OnUpdateTemplateView,
  ApplicationViewWrapperProps,
  ApplicationViewWrapperPropsNEW,
  ApplicationViewProps,
  ValidationState,
  TemplateViewWrapperProps,
  SummaryViewWrapperProps,
  SummaryViewWrapperPropsNEW,
  SummaryViewProps,
  PluginConfig,
  PluginManifest,
  PluginComponents,
  Plugins,
}
