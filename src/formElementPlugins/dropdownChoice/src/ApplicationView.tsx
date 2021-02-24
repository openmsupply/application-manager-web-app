import React, { useEffect } from 'react'
import { Dropdown, Header } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'

const ApplicationView: React.FC<ApplicationViewProps> = ({
  parameters,
  onUpdate,
  value,
  setValue,
  isEditable,
  currentResponse,
  validationState,
  onSave,
  Markdown,
  getDefaultIndex,
}) => {
  const { label, description, placeholder, search, options, default: defaultOption } = parameters

  useEffect(() => {
    onUpdate(value)
    if (!value && defaultOption !== undefined)
      onSave({ text: value, optionIndex: options.indexOf(value) })
    setValue(options[getDefaultIndex(defaultOption, options)])
  }, [])

  function handleChange(e: any, data: any) {
    const { value } = data
    setValue(value)
    onSave({ text: value, optionIndex: options.indexOf(value) })
  }

  const dropdownOptions = options.map((option: any, index: number) => {
    return {
      key: `${index}_${option}`,
      text: option,
      value: option,
      index,
    }
  })

  return (
    <>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      <Markdown text={description} />
      <Dropdown
        fluid
        selection
        search={search}
        placeholder={placeholder}
        options={dropdownOptions}
        onChange={handleChange}
        value={value}
        disabled={!isEditable}
      />
    </>
  )
}

export default ApplicationView
