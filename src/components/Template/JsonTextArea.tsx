import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

const JsonField: React.FC = ({ ...all }: any) => {
  const { defaultValue, onBlur, onChange, ...furtherProps } = all
  const [value, setValue] = useState(defaultValue)
  const [isErrorState, setIsErrorState] = useState(false)

  console.log('df: ', all)
  return (
    <TextareaAutosize
      style={{ background: isErrorState ? 'pink' : 'none' }}
      {...furtherProps}
      minRows={1}
      rows={1}
      defaultValue={JSON.stringify(defaultValue, null, ' ')}
      onChange={({ target }: any) => {
        setValue(target.value)
        try {
          onChange('na', { value: JSON.parse(target.value) })
          setIsErrorState(false)
        } catch (e) {
          setIsErrorState(true)
        }
      }}
      onBlur={() => {
        try {
          onChange('na', { value: JSON.parse(value) })
          onBlur()
          setIsErrorState(false)
        } catch (e) {
          setIsErrorState(true)
        }
      }}
    />
  )
}

export default JsonField
