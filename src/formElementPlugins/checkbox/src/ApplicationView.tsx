import React, { useEffect, useState } from 'react'
import { Checkbox, Form } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import strings from '../constants'
import config from '../pluginConfig.json'

interface Checkbox {
  label: string
  text: string
  key: string | number
  selected: boolean
}

interface CheckboxSavedState {
  text: string
  values: { [key: string]: Checkbox }
}

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  onSave,
  Markdown,
  initialValue,
}) => {
  const { isEditable } = element
  const { label, description, checkboxes, type, layout } = parameters

  const [checkboxElements, setCheckboxElements] = useState<Checkbox[]>(
    getInitialState(initialValue, checkboxes)
  )

  // When checkbox array changes after initial load (e.g. when its being dynamically loaded from an API)
  useEffect(() => {
    setCheckboxElements(getInitialState(initialValue, checkboxes))
  }, [checkboxes])

  useEffect(() => {
    // Don't save response if parameters are still loading
    if (checkboxElements[0].text === config.parameterLoadingValues.label) return
    onSave({
      text: createTextString(checkboxElements),
      values: Object.fromEntries(
        checkboxElements.map((cb) => [cb.key, { text: cb.text, selected: cb.selected }])
      ),
    })
  }, [checkboxElements])

  function toggle(e: any, data: any) {
    const { index } = data
    const changedCheckbox = { ...checkboxElements[index] }
    changedCheckbox.selected = !changedCheckbox.selected
    setCheckboxElements(checkboxElements.map((cb, i) => (i === index ? changedCheckbox : cb)))
  }

  return (
    <>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      <Markdown text={description} />
      {checkboxElements.map((cb: Checkbox, index: number) => {
        return layout === 'inline' ? (
          <Checkbox
            key={`${index}_${cb.label}`}
            label={cb.label}
            checked={cb.selected}
            onChange={toggle}
            index={index}
            toggle={type === 'toggle'}
            slider={type === 'slider'}
          />
        ) : (
          <Form.Field key={`${index}_${cb.label}`} disabled={!isEditable}>
            <Checkbox
              label={cb.label}
              checked={cb.selected}
              onChange={toggle}
              index={index}
              toggle={type === 'toggle'}
              slider={type === 'slider'}
            />
          </Form.Field>
        )
      })}
    </>
  )
}

export default ApplicationView

const getInitialState = (initialValue: CheckboxSavedState, checkboxes: Checkbox[]) => {
  // Returns a consistent array of Checkbox objects, regardless of input structure
  const { values: initValues } = initialValue
  // make sure object index is never a number (in onSave cb.key is used as keys of object)
  const normaliseKey = (key: any) => (typeof key.match(/^\d+$/) ? `index_${key}` : key)
  return (
    checkboxes
      .map((cb: Checkbox, index: number) => {
        if (typeof cb === 'string' || typeof cb === 'number')
          return { label: String(cb), text: String(cb), key: index, selected: false }
        else
          return {
            label: cb.label,
            text: cb?.text || cb.label,
            key: cb?.key || index,
            selected: cb?.selected || false,
          }
      })
      // Replaces with any already-selected values from database
      .map((cb) => ({
        ...cb,
        selected: initValues?.[cb.key] ? initValues[cb.key].selected : cb.selected,
      }))
      .map((cb) => ({ ...cb, key: normaliseKey(cb.key) }))
  )
}

const createTextString = (checkboxes: Checkbox[]) =>
  checkboxes
    .filter((cb) => cb.selected)
    .reduce((output, cb) => {
      return output + (output === '' ? cb.text : ', ' + cb.text)
    }, '')
    .replace(/^$/, `*<${strings.LABEL_SUMMMARY_NOTHING_SELECTED}>*`)
