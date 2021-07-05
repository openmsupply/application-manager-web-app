import React, { useState } from 'react'
import { Input } from 'semantic-ui-react'
import { TemplateViewProps } from '../../types'

// TODO type should be global
const TemplateView: React.FC<TemplateViewProps> = ({ parameters, onUpdate }) => {
  const [placeholder, setPlaceholder] = useState(parameters.placeholder)

  const onChange = (_: any, { value }: any) => {
    setPlaceholder(value)
    onUpdate({ placeholder: value })
  }
  return <Input fluid label={'Placeholder'} value={placeholder} onChange={onChange} />
}

export default TemplateView
