import { ApplicationDetails, ResponseFull, User } from '../../../utils/types'
export enum DisplayType {
  CARDS = 'cards',
  TABLE = 'table',
  INLINE = 'inline',
}

export interface InputResponseField {
  isValid?: boolean
  value: ResponseFull
}

export type ListItem = { [code: string]: InputResponseField }

export interface ListLayoutProps {
  listItems: ListItem[]
  displayFormat: { title?: string; subtitle?: string; description: string }
  Markdown: any
  fieldTitles?: string[]
  codes?: string[]
  editItem?: (index: number) => void
  deleteItem?: (index: number) => void
  isEditable?: boolean
  // These values required for SummaryView in Inline layout
  elements?: any
  inputFields?: any
  responses?: any
  currentUser?: User
  applicationData?: ApplicationDetails
  editItemText?: string
  deleteItemText?: string
  currentResponseElementsState?: any
  innerElementUpdate?: any
}
