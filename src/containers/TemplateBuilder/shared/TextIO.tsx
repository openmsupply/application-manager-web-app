import React, { useEffect, useState } from 'react'
import { Form, Icon, Input, Popup, SemanticICONS, TextArea } from 'semantic-ui-react'
import { SemanticCOLORS } from 'semantic-ui-react/dist/commonjs/generic'

const iconLink = 'https://react.semantic-ui.com/elements/icon/'

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
  iconColor?: SemanticCOLORS
  onIconClick?: () => void
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
  iconColor,
  onIconClick,
}) => {
  const [defaultRows] = useState(getDefaultRows(text, textAreaDefaulRows))
  const [innerValue, setInnerValue] = useState(text)
  const style = color ? { color } : {}

  useEffect(() => {
    if (isPropUpdated) setInnerValue(text)
  }, [text])

  const renderText = () => {
    if (setText) return null

    return (
      <div className="io-component value" style={{ whiteSpace: isTextArea ? 'normal' : 'nowrap' }}>
        {text}
      </div>
    )
  }

  const renderInput = () => {
    if (!setText) return null

    if (isTextArea) {
      return (
        <div className="io-component value">
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
        className="io-component value"
        size="small"
        onChange={(_, { value }) => {
          setInnerValue(value)
        }}
        // Dont' want to try and query api on every key change of query text
        onBlur={() => setText(innerValue, setInnerValue)}
      />
    )
  }

  const renderIcon = () => {
    const color = iconColor
    const className = !!onIconClick ? 'clickable' : ''
    return (
      <Icon
        style={style}
        color={color}
        className={className}
        onClick={onIconClick}
        name={icon as SemanticICONS}
      />
    )
  }

  const renderLabel = () => {
    if (link) {
      return (
        <div style={style} className="io-component key">
          <a style={style} target="_blank" href={link}>
            {title} {icon && renderIcon()}
          </a>
        </div>
      )
    }
    return (
      <div style={style} className="io-component key">
        {title} {icon && renderIcon()}
      </div>
    )
  }

  return (
    <Popup
      content={disabledMessage}
      disabled={!disabled || !disabledMessage}
      trigger={
        <div className="io-wrapper">
          {renderLabel()}
          {renderText()}
          {renderInput()}
        </div>
      }
    />
  )
}

export default TextIO
export { iconLink }
