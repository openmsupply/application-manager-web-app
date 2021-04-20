import React, { useEffect, useState } from 'react'
import { Checkbox, Form } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import strings from '../constants'

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

  useEffect(() => {
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
  )
}

const createTextString = (checkboxes: Checkbox[]) =>
  checkboxes
    .filter((cb) => cb.selected)
    .reduce((output, cb) => {
      return output + (output === '' ? cb.text : ', ' + cb.text)
    }, '')
    .replace(/^$/, `*<${strings.LABEL_SUMMMARY_NOTHING_SELECTED}>*`)
