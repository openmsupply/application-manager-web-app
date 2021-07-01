import React, { useEffect, useState } from 'react'
import { Checkbox, Dropdown, Form, Icon, Input, Label, TextArea } from 'semantic-ui-react'
import { ComponentLibraryType } from './types'
// All 'sets' are done onBlur (loose focus), to avoid excessible evaluations (especially for api types)
const ComponentLibrary: ComponentLibraryType = {
  TextInput: ({ text, setText, title = '', disabled = false }) => {
    const [innerValue, setInnerValue] = useState(text)

    return (
      <div className="evaluator-input ">
        <Label className="key">{title}</Label>
        <Input
          value={innerValue}
          disabled={disabled}
          className="value"
          size="small"
          onChange={(_, { value }) => {
            setInnerValue(value)
          }}
          // Dont' want to try and query api on every key change of query text
          onBlur={() => setText(innerValue)}
        />
      </div>
    )
  },
  ObjectInput: ({ object, setObject }) => {
    const [innerValue, setInnerValue] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    console.log('here')
    const checkAndUpdateState = (value: string) => {
      try {
        JSON.parse(value)
        setErrorMessage('')
      } catch (e) {
        setErrorMessage('Invalid JSON')
      }
      setInnerValue(value)
    }

    const checkAndSetObject = (value: string) => {
      try {
        const object = JSON.parse(value)
        setObject(object)
        setErrorMessage('')
        setInnerValue(JSON.stringify(object, null, '  '))
      } catch (e) {
        setErrorMessage('Invalid JSON')
      }
    }

    useEffect(() => {
      setInnerValue(JSON.stringify(object, null, ' '))
    }, [])

    return (
      <Form className="evaluator-single-input ">
        <TextArea
          value={innerValue}
          error={!!errorMessage}
          helperText={errorMessage}
          className="value"
          rows={5}
          onBlur={() => {
            try {
              checkAndSetObject(innerValue)
            } catch (e) {}
          }}
          onChange={async (_, { value }) => {
            checkAndUpdateState(String(value))
          }}
        />
      </Form>
    )
  },

  NumberInput: ({ number, setNumber, title = '' }) => {
    const [innerValue, setInnerValue] = useState(String(number))

    return (
      <div className="evaluator-input ">
        <Label className="key">{title}</Label>
        <Input
          value={innerValue}
          className="value"
          size="small"
          onChange={async (_, { value }) => {
            if (!value.match(/^[\d]+$/)) return
            setInnerValue(value)
          }}
          onBlur={() => {
            try {
              setNumber(Number(innerValue))
            } catch (e) {}
          }}
        />
      </div>
    )
  },
  Add: ({ onClick, title = '' }) => (
    <div
      className="clickable"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 7,
        padding: 3,
        background: '#E8E8E8',
        margin: 3,
      }}
    >
      {title && <Label style={{ whiteSpace: 'nowrap', margin: 0, marginRight: 2 }}>{title}</Label>}
      <Icon name="add" onClick={onClick} />
    </div>
  ),
  Remove: ({ onClick }) => (
    <div
      className="clickable"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 7,
        padding: 3,
        background: '#E8E8E8',
        margin: 3,
      }}
    >
      <Label style={{ whiteSpace: 'nowrap', margin: 0, marginRight: 2 }}>Remove</Label>
      <Icon name="delete" onClick={onClick} />
    </div>
  ),
  Selector: ({ selections, selected, setSelected, title }) => {
    const options = selections.map((selection, index) => ({
      key: index,
      value: selection,
      text: selection,
    }))

    return (
      <div className="evaluator-input">
        <Label className="key">{title}</Label>
        <Dropdown
          className="value"
          options={options}
          selection
          size="tiny"
          value={selected}
          onChange={(_, { value }) => {
            setSelected(String(value))
          }}
        />
      </div>
    )
  },
  Checkbox: ({ checked, setChecked, title = '', disabled = false }) => {
    const [innerValue, setInnerValue] = useState(checked)

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 7,
          padding: 3,
          background: '#E8E8E8',
        }}
      >
        {title && (
          <Label style={{ whiteSpace: 'nowrap', margin: 0, marginRight: 2 }}>{title}</Label>
        )}
        <Checkbox
          checked={innerValue}
          toggle
          disabled={disabled}
          size="small"
          onChange={() => {
            const value = innerValue
            setInnerValue(!value)
            setChecked(!value)
          }}
        />
      </div>
    )
  },
  Error: ({ error, info }) => (
    <div>
      {error}
      {info}
    </div>
  ),
  Step: () => <div style={{ width: 20 }} />,
  Label: ({ title }) => <Label style={{ margin: 3, padding: 10, fontSize: 14 }}>{title}</Label>,
  OperatorContainer: ({ children }) => (
    <div
      className="evaluator-operator-container"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        border: '2px solid rgba(0,0,0,0.2)',
        borderRadius: 7,
        margin: 2,
        padding: 5,
      }}
    >
      {children}
    </div>
  ),
  FlexColumn: ({ children }) => (
    <div
      style={{
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      {children}
    </div>
  ),
  FlexRow: ({ children }) => (
    <div
      style={{
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      {children}
    </div>
  ),
}

export default ComponentLibrary
