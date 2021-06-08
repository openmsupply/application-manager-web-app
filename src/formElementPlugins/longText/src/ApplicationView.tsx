import React, { useState, useEffect } from 'react'
import { Form, Input } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  onUpdate,
  setIsActive,
  currentResponse,
  validationState,
  onSave,
  Markdown,
}) => {
  const [value, setValue] = useState<string | null | undefined>(currentResponse?.text)

  const { label, description, placeholder, lines, maxLength } = parameters

  const { isEditable } = element

  function handleChange(e: any) {
    let text = e.target.value
    if (maxLength && text.length > maxLength) {
      text = text.substring(0, maxLength)
    }
    onUpdate(text)
    setValue(text)
  }

  function handleLoseFocus(e: any) {
    onSave({ text: value })
  }

  return (
    <>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      <Markdown text={description} />
      <Form.TextArea
        placeholder={placeholder}
        rows={lines || 5}
        onChange={handleChange}
        onBlur={handleLoseFocus}
        onFocus={setIsActive}
        value={value ? value : ''}
        disabled={!isEditable}
        error={
          !validationState.isValid
            ? {
                content: validationState?.validationMessage,
                pointing: 'above',
              }
            : null
        }
      />
    </>
  )
}

export default ApplicationView
