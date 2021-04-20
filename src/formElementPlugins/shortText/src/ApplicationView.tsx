import React, { useEffect } from 'react'
import { Form } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  onUpdate,
  value,
  setValue,
  setIsActive,
  validationState,
  onSave,
  Markdown,
}) => {
  const { isEditable } = element
  const { placeholder, maskedInput, label, description, maxLength } = parameters

  useEffect(() => {
    onUpdate(value)
  }, [])

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
      <Form.Input
        fluid
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleLoseFocus}
        onFocus={setIsActive}
        value={value ? value : ''}
        disabled={!isEditable}
        type={maskedInput ? 'password' : undefined}
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
