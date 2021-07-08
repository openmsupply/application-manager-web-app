import React, { useEffect, useState } from 'react'
import { Dropdown, Popup } from 'semantic-ui-react'

type StringOrNumber = number | string
type GetterOrKey = ((row: any) => StringOrNumber) | string

type DropdownIOprops = {
  value: StringOrNumber
  title?: string
  setValue?: (
    value: StringOrNumber,
    fullValue: any,
    resetValue: (value: StringOrNumber) => void
  ) => void
  disabled?: boolean
  disabledMessage?: string
  link?: string
  isPropUpdated?: boolean
  options?: any[]
  getKey?: GetterOrKey
  getValue?: GetterOrKey
  getText?: GetterOrKey
}

const defaultGetters: GetterOrKey = (row) => String(row)

const getterOrKeyHelper = (getterOrKey: GetterOrKey, value: any) => {
  try {
    if (typeof getterOrKey === 'function') return getterOrKey(value)
    if (typeof getterOrKey === 'string') return value[getterOrKey]
  } catch (e) {
    console.log(e)
    return 'cant resolve row'
  }
}

const DropdownIO: React.FC<DropdownIOprops> = ({
  value,
  setValue,
  disabled = false,
  title = '',
  disabledMessage,
  link,
  isPropUpdated = false,
  options = [],
  getKey = defaultGetters,
  getValue = defaultGetters,
  getText = defaultGetters,
}) => {
  const [innerValue, setInnerValue] = useState(value)

  useEffect(() => {
    if (isPropUpdated) setInnerValue(value)
  }, [value])
  const renderText = () => {
    if (setValue) return null

    return <div className="text-io-component value">{value}</div>
  }

  const renderDropdown = () => {
    if (!setValue) return null
    const calculatedOptions = options.map((value) => ({
      text: getterOrKeyHelper(getText, value),
      key: getterOrKeyHelper(getKey, value),
      value: getterOrKeyHelper(getValue, value),
    }))
    console.log(calculatedOptions, options)
    return (
      <Dropdown
        value={innerValue}
        disabled={disabled}
        className="text-io-component value"
        options={calculatedOptions}
        size="small"
        onChange={(_, { value }) => {
          if (typeof value !== 'string' && typeof value !== 'number') return
          setInnerValue(value)
          const fullValue = options.find((_value) => value === getterOrKeyHelper(getValue, _value))
          setValue(value, fullValue, setInnerValue)
        }}
      />
    )
  }

  const renderLabel = () => {
    if (link) {
      return (
        <div className="text-io-component key">
          <a target="_blank" href={link}>
            {title}
          </a>
        </div>
      )
    }
    return <div className="text-io-component key">{title}</div>
  }

  return (
    <Popup
      content={disabledMessage}
      disabled={!disabled || !disabledMessage}
      trigger={
        <div className="text-io-wrapper">
          {renderLabel()}
          {renderText()}
          {renderDropdown()}
        </div>
      }
    />
  )
}

export default DropdownIO
