import React, { useState } from 'react'
import { Header, Input } from 'semantic-ui-react'
import CheckboxIO from '../shared/CheckboxIO'
import { IconButton } from '../shared/IconButton'
import DropdownIO from '../shared/DropdownIO'
import JsonIO from '../shared/JsonIO'
import TextIO from '../shared/TextIO'
import { ComponentLibraryType } from './types'

// All 'sets' are done onBlur (loose focus), to avoid excessible evaluations (especially for api types)
const ComponentLibrary: ComponentLibraryType = {
  TextInput: ({ text, setText, title = '', disabled = false }) => (
    <div className="long">
      <TextIO
        isPropUpdated={true}
        title={title}
        text={text}
        setText={setText}
        disabled={disabled}
      />
    </div>
  ),
  ObjectInput: ({ object, setObject }) => (
    <div className="long">
      <JsonIO label={''} object={object} isPropUpdated={true} setObject={setObject} />
    </div>
  ),

  NumberInput: ({ number, setNumber, title = '' }) => {
    const [innerValue, setInnerValue] = useState(String(number))

    return (
      <div className="io-wrapper">
        <div className="io-component key">{title}</div>
        <Input
          value={innerValue}
          className="io-component value"
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
    <IconButton name="add square" title={title} onClick={onClick} />
  ),
  Remove: ({ onClick }) => <IconButton name="window close" title="remove" onClick={onClick} />,
  Selector: ({ selections, selected, setSelected, title }) => (
    <DropdownIO
      title={title}
      isPropUpdated={true}
      value={selected}
      setValue={(selected) => setSelected(String(selected))}
      options={selections}
    />
  ),
  Checkbox: ({ checked, setChecked, title = '', disabled = false }) => (
    <CheckboxIO title={title} value={checked} setValue={setChecked} disabled={disabled} />
  ),
  Error: ({ error, info }) => (
    <div>
      {error}
      {info}
    </div>
  ),
  Step: () => <div style={{ width: 20 }} />,
  Label: ({ title }) => (
    <>
      <div className="spacer-10" />
      <Header as="h6" className="no-margin-no-padding">
        {title}
      </Header>
    </>
  ),
  OperatorContainer: ({ children }) => (
    <div className="evaluator-operator-container">{children}</div>
  ),
  FlexColumn: ({ children }) => <div className="flex-column-start-start">{children}</div>,
  FlexRow: ({ children }) => <div className="flex-row-start-center">{children}</div>,
}

export default ComponentLibrary
