import React from 'react'
import { TemplateElement } from '../../../utils/generated/graphql'
import { SummaryViewProps } from '../../types'
import { Form } from 'semantic-ui-react'
import { ListCardLayout, ListTableLayout, ListInlineLayout } from './displayComponents'
import { getDefaultDisplayFormat } from './helpers'
import { DisplayType, ListLayoutProps } from './types'
import strings from '../constants'

const SummaryView: React.FC<SummaryViewProps> = ({ parameters, Markdown, response }) => {
  const {
    displayType,
    inputFields,
    label,
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

  const DisplayComponent =
    displayType === DisplayType.TABLE ? (
      <ListTableLayout {...listDisplayProps} />
    ) : displayType === DisplayType.INLINE ? (
      <ListInlineLayout {...listDisplayProps} inputFields={inputFields} />
    ) : (
      <ListCardLayout {...listDisplayProps} />
    )

  return (
    <Form.Field>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      {DisplayComponent}
    </Form.Field>
  )
}

export default SummaryView
