import React, { useEffect, useState } from 'react'
import { Checkbox, Form } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import { ApplicationViewWrapperProps, PluginComponents, ValidationState } from '../../types'
import { ErrorBoundary, pluginProvider } from '../../'
import strings from '../constants'
import { EvaluatorNode } from '../../../utils/types'

interface SimplifiedElement {
  code: string
  title: string
  pluginCode: string
  validationExpression: EvaluatorNode
  validationMessage: string | null
  parameters: any
  isEditable: boolean
  isRequired: boolean
  isVisible: boolean
}

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  onSave,
  Markdown,
  initialValue,
  validate,
  ...props
}) => {
  const { isEditable } = element
  const { label, description, inputFields } = parameters

  const [listElements, setListElements] = useState([])
  const [inputElements, setInputElements] = useState(createInputElements(inputFields))

  const onUpdate = async (value: any) => {
    // Do something instead of default behaviour
  }

  const updateList = async (jsonValue: any) => {
    // Update listElements
  }

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
      {inputElements.map((element: any) => {
        console.log('element', element)
        return (
          <InputElement
            key={element.code}
            code={element.code}
            // onUpdate={onUpdate}
            // onSave={onSave}
            // initialValue={}
            {...props}
            element={element}
            parameters={element.parameters}
            // value={elemevalue}
            // setValue={setValue}
            // setIsActive={setIsActive}
            Markdown={Markdown}
            // validationState={validationState || { isValid: true }}
            validate={validate}
          />
        )
      })}
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

// InputField is a simplified version of ApplicationViewWrapper
const InputElement: React.FC<any> = ({
  elementTypePluginCode,
  code,
  parameters,
  Markdown,
  validate,
  element,
  ...props
}) => {
  const { ApplicationView, config }: PluginComponents = pluginProvider.getPluginElement(
    element.pluginCode
  )
  return (
    <React.Suspense fallback="Loading Plugin">
      <Form.Field style={inputElementStyleOverrides}>
        <ApplicationView
          {...props}
          parameters={parameters}
          // value={props.value}
          setValue={() => {}}
          Markdown={Markdown}
          element={element}
        />
      </Form.Field>
    </React.Suspense>
  )
}

const inputElementStyleOverrides = {}

const createInputElements = (inputFields: any): SimplifiedElement[] => {
  return inputFields.map((element: any) => ({
    code: element.code,
    title: element.title,
    pluginCode: element.elementTypePluginCode,
    validationExpression: element?.validation ?? true,
    validationMessage: element?.validationMessage,
    parameters: element.parameters,
    // Replace the below with expressions from ???
    isEditable: true,
    isRequired: false,
    isVisible: true,
  }))
}

export default ApplicationView
