import { ApplicationResponse, TemplateElement } from '../utils/generated/graphql'
import { ElementState, ResponseFull, ResponsesByCode } from '../utils/types'

interface OnUpdateApplicationView {
  (updateObject: { value?: any; isValid: boolean | undefined }): void
}

type BasicObject = {
  [key: string]: any
}

interface ApplicationViewWrapperProps {
  templateElement: TemplateElement
  isVisible: boolean
  isEditable: boolean
  isRequired: boolean
  allResponses: ResponsesByCode
  currentResponse: ApplicationResponse | null
  // applicationState,
  // graphQLclient
  initialValue: any // Could be a primative or an object with any shape
}

interface ApplicationViewProps extends ApplicationViewWrapperProps {
  onUpdate: Function
  onSave: Function
  validationState: {
    isValid: boolean | undefined
    validationMessage: string | undefined
  }
}

interface SummaryViewProps {
  parameters: BasicObject
  value: ResponseFull | null
}

interface SummaryViewWrapperProps {
  element: ElementState
  value: ResponseFull | null
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
  folderName: string
  displayName: string
  category: 'Input' | 'Informative'
}

interface PluginManifest {
  [key: string]: PluginConfig
}

interface PluginComponents {
  [key: string]: React.FunctionComponent<
    ApplicationViewProps | TemplateViewProps | SummaryViewProps
  >
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
  ApplicationViewProps,
  TemplateViewWrapperProps,
  SummaryViewWrapperProps,
  SummaryViewProps,
  PluginConfig,
  PluginManifest,
  PluginComponents,
  Plugins,
}
