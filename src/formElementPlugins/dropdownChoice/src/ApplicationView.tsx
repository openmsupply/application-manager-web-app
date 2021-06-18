import React, { useEffect, useState } from 'react'
import { Dropdown, Label } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  currentResponse,
  validationState,
  onSave,
  Markdown,
  getDefaultIndex,
}) => {
  const {
    label,
    description,
    placeholder,
    search,
    options,
    optionsDisplayProperty,
    default: defaultOption,
  } = parameters

  const [selectedIndex, setSelectedIndex] = useState<number>()
  const { isEditable } = element

  useEffect(() => {
    // Ensures default values are saved and selected when parameters change
    if (!currentResponse?.text && defaultOption !== undefined) {
      const optionIndex = getDefaultIndex(defaultOption, options)
      onSave({
        text: getSelectedText(options, optionsDisplayProperty, optionIndex),
        selection: options[optionIndex],
        optionIndex,
      })
      setSelectedIndex(optionIndex)
    }
    if (currentResponse?.text) {
      const { optionIndex } = currentResponse
      setSelectedIndex(optionIndex)
      // Check if response has changed
      if (currentResponse.text !== getSelectedText(options, optionsDisplayProperty, optionIndex)) {
        console.log("It's changed", currentResponse.text)
        setSelectedIndex(getDefaultIndex(defaultOption, options))
        onSave({
          text: getSelectedText(options, optionsDisplayProperty, selectedIndex),
          selection: options[selectedIndex as number],
          optionIndex,
        })
      }
    }
  }, [defaultOption, options])

  const handleChange = (e: any, data: any) => {
    const { value: optionIndex } = data
    setSelectedIndex(optionIndex === '' ? undefined : optionIndex)
    if (optionIndex !== '')
      onSave({
        text: getSelectedText(options, optionsDisplayProperty, optionIndex),
        selection: options[optionIndex],
        optionIndex,
      })
    // Reset response if selection cleared
    else onSave(null)
  }

  const dropdownOptions = Array.isArray(options)
    ? options.map((option: any, index: number) => {
        return {
          key: `${index}_${option}`,
          text: optionsDisplayProperty ? option[optionsDisplayProperty] : option,
          value: index,
        }
      })
    : []

  return (
    <>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      <Markdown text={description} />
      <Dropdown
        fluid
        selection
        clearable
        search={search}
        placeholder={placeholder}
        options={dropdownOptions}
        onChange={handleChange}
        value={selectedIndex}
        disabled={!isEditable}
        error={!validationState.isValid ? true : undefined}
      />
      {validationState.isValid ? null : (
        <Label basic color="red" pointing>
          {validationState?.validationMessage}
        </Label>
      )}
    </>
  )
}

const getSelectedText = (
  options: any[],
  optionsDisplayProperty: string | undefined,
  index: number = -1
) => (optionsDisplayProperty ? options?.[index]?.[optionsDisplayProperty] : options?.[index])

export default ApplicationView
