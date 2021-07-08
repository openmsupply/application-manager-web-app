import React, { useEffect, useState } from 'react'

import { Label, Input, Icon, Popup, Form, TextArea } from 'semantic-ui-react'
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic'

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

type IconButtonProps = {
  disabledMessage?: string
  disabled?: boolean
  title?: string
  name: SemanticICONS
  onClick: () => void
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  onClick,
  title = '',
  disabledMessage,
  disabled = false,
}) => {
  const renderIcon = () => (
    <Icon
      className={`icon-button ${disabled ? '' : 'clickable'}`}
      name={name}
      onClick={() => (disabled ? console.log('action disable') : onClick())}
    />
  )
  return (
    <Popup
      content={disabledMessage}
      disabled={!disabled || !disabledMessage}
      trigger={
        <>
          {title && (
            <div className={`text-io-wrapper ${disabled ? '' : 'clickable'}`}>
              <div className="text-io-component key">{title}</div>
              <div className="text-io-component value">{renderIcon()}</div>
            </div>
          )}
          {!title && renderIcon()}
        </>
      }
    />
  )
}
