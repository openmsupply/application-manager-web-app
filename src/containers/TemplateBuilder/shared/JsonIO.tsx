import React, { useState, useEffect } from 'react'
import { Label } from 'semantic-ui-react'
import TextIO from './TextIO'

const JsonIO: React.FC<{
  object: object
  label: string
  setObject: (value: object) => void
  isPropUpdated?: boolean
}> = ({ object, setObject, label, isPropUpdated = false }) => {
  const [isError, setIsError] = useState(false)

  const getInitialValue = () => {
    try {
      return JSON.stringify(object, null, ' ')
    } catch (e) {
      return '{}'
    }
  }
  const [value, setValue] = useState(getInitialValue())

  useEffect(() => {
    if (isPropUpdated) {
      setValue(getInitialValue())
    }
  }, [object])

  const tryToSetValue = (value: string) => {
    try {
      const parseValue = JSON.parse(value)
      setObject(parseValue)
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

export default JsonIO
