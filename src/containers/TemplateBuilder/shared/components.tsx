import React, { useEffect, useState } from 'react'
import { Label, Input, Icon, Popup, Button, Form, TextArea, Dropdown } from 'semantic-ui-react'
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic'

type TextIOprops = {
  text?: string
  title?: string
  setText?: (text: string, resetValue: (text: string) => void) => void
  disabled?: boolean
  disabledMessage?: string
  icon?: string
  color?: string
  link?: string
  isTextArea?: boolean
  isPropUpdated?: boolean
  textAreaDefaulRows?: number
}

const getDefaultRows = (text: string, textAreaDefaulRows: number) => {
  const rowsInText = text.match(/[\n]/g)?.length || 0
  return rowsInText === 0 ? textAreaDefaulRows : rowsInText + 2
}

const TextIO: React.FC<TextIOprops> = ({
  text = '',
  setText,
  disabled = false,
  title = '',
  icon,
  disabledMessage,
  color,
  link,
  isTextArea = false,
  textAreaDefaulRows = 4,
  isPropUpdated = false,
}) => {
  const [defaultRows] = useState(getDefaultRows(text, textAreaDefaulRows))
  const [innerValue, setInnerValue] = useState(text)
  const style = color ? { color } : {}

  const renderText = () => {
    if (setText) return null

    return <div className="text-io-component value">{text}</div>
  }

  const renderInput = () => {
    if (!setText) return null

    if (isTextArea) {
      return (
        <div className="text-io-component value">
          <Form>
            <TextArea
              disabled={disabled}
              value={innerValue}
              rows={defaultRows}
              onBlur={() => setText(innerValue, setInnerValue)}
              onChange={(_, { value }) => {
                setInnerValue(String(value))
              }}
            />
          </Form>
        </div>
      )
    }

    return (
      <Input
        value={innerValue}
        disabled={disabled}
        className="text-io-component value"
        size="small"
        onChange={(_, { value }) => {
          setInnerValue(value)
        }}
        // Dont' want to try and query api on every key change of query text
        onBlur={() => setText(innerValue, setInnerValue)}
      />
    )
  }

  const renderLabel = () => {
    if (link) {
      return (
        <div style={style} className="text-io-component key">
          <a style={style} target="_blank" href={link}>
            {title} {icon && <Icon style={style} name={icon as SemanticICONS} />}
          </a>
        </div>
      )
    }
    return (
      <div style={style} className="text-io-component key">
        {title} {icon && <Icon style={style} name={icon as SemanticICONS} />}
      </div>
    )
  }

  return (
    <Popup
      content={disabledMessage}
      disabled={!disabled || !disabledMessage}
      trigger={
        <div className="text-io-wrapper">
          {renderLabel()}
          {renderText()}
          {renderInput()}
        </div>
      }
    />
  )
}

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
  getKey: GetterOrKey
  getValue: GetterOrKey
  getText: GetterOrKey
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

  const renderText = () => {
    if (setValue) return null

    return <div className="text-io-component value">{value}</div>
  }

  const renderDropdown = () => {
    if (!setValue) return null

    return (
      <Dropdown
        value={innerValue}
        disabled={disabled}
        className="text-io-component value"
        options={options.map((value) => ({
          text: getterOrKeyHelper(getText, value),
          key: getterOrKeyHelper(getKey, value),
          value: getterOrKeyHelper(getValue, value),
        }))}
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

type ButtonWithFallbackProps = {
  onClick: () => void
  title: string
  disabled?: boolean
  disabledMessage?: string
}

const ButtonWithFallback: React.FC<ButtonWithFallbackProps> = ({
  onClick,
  title,
  disabled = false,
  disabledMessage,
}) => (
  <Popup
    content={disabledMessage}
    disabled={!disabled || !disabledMessage}
    trigger={
      <div>
        <Button inverted primary size="tiny" disabled={disabled} onClick={onClick}>
          {title}
        </Button>
      </div>
    }
  />
)

const JsonIO: React.FC<{
  initialValue: object
  label: string
  update: (value: object) => void
  isPropUpdated?: boolean
}> = ({ initialValue, update, label, isPropUpdated = false }) => {
  const [isError, setIsError] = useState(false)

  const getInitialValue = () => {
    try {
      return JSON.stringify(initialValue, null, ' ')
    } catch (e) {
      return '{}'
    }
  }
  const [value, setValue] = useState(getInitialValue())

  useEffect(() => {
    if (isPropUpdated) {
      setValue(getInitialValue())
    }
  }, [initialValue])

  const tryToSetValue = (value: string) => {
    try {
      const parseValue = JSON.parse(value)
      update(parseValue)
      setIsError(false)

      return JSON.stringify(parseValue, null, ' ')
    } catch (e) {
      setIsError(true)
      return value
    }
  }

  return (
    <>
      <TextIO
        key="categoryCode"
        text={value}
        title={label}
        isPropUpdated={isPropUpdated}
        isTextArea={true}
        setText={(value, resetValue) => resetValue(tryToSetValue(value))}
      />
      {isError && (
        <Label basic color="red" pointing="above">
          Not a valid JSON
        </Label>
      )}
    </>
  )
}

const iconLink = 'https://react.semantic-ui.com/elements/icon/'

export const OnBlurInput: React.FC<{
  label: string
  initialValue: string
  disabled?: boolean
  isIcon?: boolean
  isPropUpdated?: boolean
  isColor?: boolean
  textAreaRows?: number
  isTextArea?: boolean
  update: (value: string, resetValue: (value: string) => void) => void
}> = ({
  label,
  initialValue,
  update,
  disabled = false,
  isIcon,
  isColor,
  isTextArea = false,
  isPropUpdated = false,
  textAreaRows = 5,
}) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (isPropUpdated) {
      setValue(initialValue)
    }
  }, [initialValue])
  return (
    <div className="on-blur-input">
      {isIcon && (
        <a target="_blank" href={'https://react.semantic-ui.com/elements/icon/'}>
          Icon
          <Icon name={value as SemanticICONS} />
        </a>
      )}
      {isColor && (
        <a target="_blank" href={'https://www.w3schools.com/cssref/css_colors.asp'}>
          <div style={{ color: value }}>{label}</div>
        </a>
      )}
      {!isIcon && !isColor && label && <Label content={label} />}
      {!isTextArea && (
        <Input
          disabled={disabled}
          value={value}
          onBlur={() => update(value, setValue)}
          onChange={async (_, { value }) => setValue(value)}
        />
      )}
      {isTextArea && (
        <Form>
          <TextArea
            disabled={disabled}
            value={value}
            rows={textAreaRows}
            onBlur={() => update(value, setValue)}
            onChange={async (_, { value }) => {
              setValue(String(value))
            }}
          />
        </Form>
      )}
    </div>
  )
}

export { iconLink, TextIO, ButtonWithFallback, JsonIO, DropdownIO }
