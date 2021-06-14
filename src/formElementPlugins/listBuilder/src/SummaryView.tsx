import React from 'react'
import { TemplateElement } from '../../../utils/generated/graphql'
import { SummaryViewProps } from '../../types'
import {
  ListCardLayout,
  ListTableLayout,
  ListLayoutProps,
  DisplayType,
  getDefaultDisplayFormat,
} from './ApplicationView'

const SummaryView: React.FC<SummaryViewProps> = ({ parameters, Markdown, response }) => {
  const {
    displayType,
    inputFields,
    displayFormat = getDefaultDisplayFormat(inputFields),
  } = parameters

  const listDisplayProps: ListLayoutProps = {
    listItems: response?.list ?? [],
    displayFormat,
    fieldTitles: inputFields.map((e: TemplateElement) => e.title),
    codes: inputFields.map((e: TemplateElement) => e.code),
    Markdown,
    isEditable: false,
  }

  return displayType === DisplayType.TABLE ? (
    <ListTableLayout {...listDisplayProps} />
  ) : (
    <ListCardLayout {...listDisplayProps} />
  )
}

export default SummaryView
