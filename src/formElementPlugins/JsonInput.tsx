import React, { useState } from 'react'
import { Input } from 'semantic-ui-react'

type JsonInputProps = {
  label: string
  initialValue: string
  onUpdate: any
}

const JsonInput: React.FC<JsonInputProps> = ({
  label,
  initialValue,
  onUpdate,
}) => {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState(false)

  return (
    <Input
      fluid
      label={label}
      onChange={onChange(setError, setValue, onUpdate)}
      value={value}
      error={error}
    />
  )
}

function onChange(setError: any, setValue: any, onUpdate: any) {
  return (_: any, { value }: any) => {
    setValue(value)

    try {
      JSON.parse(value)
      onUpdate(value)
      setError(false)
    } catch (e) {
      setError(true)
    }
  }
}

export default JsonInput
