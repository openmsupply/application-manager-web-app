import React, { useEffect, useState } from 'react'
import { Label, Input, Icon, Popup, Button } from 'semantic-ui-react'
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
  isPropUpdated = false,
}) => {
  const [innerValue, setInnerValue] = useState(text)
  const style = color ? { color } : {}

  const renderText = () => {
    if (setText) return null

    return <div className="text-io-component value">{text}</div>
  }

  const renderInput = () => {
    if (!setText) return null

    return (
      <Popup
        content={disabledMessage}
        disabled={!disabled || !disabledMessage}
        trigger={
          <Input
            value={innerValue}
            disabled={disabled}
            className="text-io-component  value"
            size="small"
            onChange={(_, { value }) => {
              setInnerValue(value)
            }}
            // Dont' want to try and query api on every key change of query text
            onBlur={() => setText(innerValue, setInnerValue)}
          />
        }
      />
    )
  }

  const renderLabel = () => {
    if (link) {
      return (
        <div style={style} className="text-io-component key">
          <a target="_blank" href={link}>
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
    <div className="text-io-wrapper">
      {renderLabel()}
      {renderText()}
      {renderInput()}
    </div>
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

const JsonTextBox: React.FC<{
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
      <OnBlurInput
        key="categoryCode"
        initialValue={value}
        label={label}
        isPropUpdated={isPropUpdated}
        isTextArea={true}
        update={(value, resetValue) => resetValue(tryToSetValue(value))}
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

export { iconLink, TextIO, ButtonWithFallback, JsonTextBox }
