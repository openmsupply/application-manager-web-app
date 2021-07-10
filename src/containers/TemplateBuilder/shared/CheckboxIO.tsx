import React, { useEffect, useState } from 'react'
import { Checkbox, Popup } from 'semantic-ui-react'

type CheckboxIOprops = {
  value: boolean
  title: string
  setValue: (value: boolean) => boolean | undefined | void
  disabled?: boolean
  disabledMessage?: string
  isPropUpdated?: boolean
}

const CheckboxIO: React.FC<CheckboxIOprops> = ({
  value,
  setValue,
  disabled = false,
  title,
  disabledMessage,
  isPropUpdated = false,
}) => {
  const [innerValue, setInnerValue] = useState(value)

  useEffect(() => {
    console.log(value)
    if (isPropUpdated) setInnerValue(() => value)
  }, [value])

  return (
    <Popup
      content={disabledMessage}
      disabled={!disabled || !disabledMessage}
      trigger={
        <div className="io-wrapper checkbox">
          {title && <div className="io-component key">{title}</div>}
          <Checkbox
            checked={innerValue}
            toggle
            disabled={disabled}
            size="small"
            onChange={() => {
              console.log('yow')
              const newValue = !innerValue
              const result = setValue(newValue)
              if (typeof result === 'boolean') setInnerValue(result)
              else setInnerValue(newValue)
            }}
          />
        </div>
      }
    />
  )
}

export default CheckboxIO
