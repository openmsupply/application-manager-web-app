import React, { useState } from 'react'
import { Checkbox, Popup } from 'semantic-ui-react'

type CheckboxIOprops = {
  value: boolean
  title: string
  setValue: (value: boolean, resetValue: (value: boolean) => void) => void
  disabled?: boolean
  disabledMessage?: string
}

const CheckboxIO: React.FC<CheckboxIOprops> = ({
  value,
  setValue,
  disabled = false,
  title,
  disabledMessage,
}) => {
  const [innerValue, setInnerValue] = useState(value)

  return (
    <Popup
      content={disabledMessage}
      disabled={!disabled || !disabledMessage}
      trigger={
        <div className="text-io-wrapper checkbox">
          {title && <div className="text-io-component key">{title}</div>}
          <Checkbox
            checked={innerValue}
            toggle
            size="small"
            onChange={() => {
              const newValue = !innerValue
              setValue(newValue, setInnerValue)
              setInnerValue(newValue)
            }}
          />
        </div>
      }
    />
  )
}

export default CheckboxIO
