import React, { useEffect, useState } from 'react'
import { Checkbox, Form } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import strings from '../constants'

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  onSave,
  Markdown,
  initialValue,
  ...props
}) => {
  const { isEditable } = element
  const { label, description, inputFields } = parameters

  console.log('inputFields', inputFields)

  // const [checkboxElements, setCheckboxElements] = useState<Checkbox[]>(
  //   getInitialState(initialValue, checkboxes)
  // )

  // useEffect(() => {
  //   onSave({
  //     text: createTextString(checkboxElements),
  //     values: Object.fromEntries(
  //       checkboxElements.map((cb) => [cb.key, { text: cb.text, selected: cb.selected }])
  //     ),
  //   })
  // }, [checkboxElements])

  // function toggle(e: any, data: any) {
  //   const { index } = data
  //   const changedCheckbox = { ...checkboxElements[index] }
  //   changedCheckbox.selected = !changedCheckbox.selected
  //   setCheckboxElements(checkboxElements.map((cb, i) => (i === index ? changedCheckbox : cb)))
  // }

  return (
    <>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      <Markdown text={description} />
      {/* {checkboxElements.map((cb: Checkbox, index: number) => {
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
      })} */}
    </>
  )
}

export default ApplicationView
