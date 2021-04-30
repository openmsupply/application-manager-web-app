import React, { useState, useEffect } from 'react'
import { Form, Checkbox } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import config from '../../../config'

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  value,
  // setValue
  setIsActive,
  validationState,
  onSave,
  Markdown,
  validate,
}) => {
  const { isEditable } = element
  const {
    placeholder,
    confirmPlaceholder,
    maskedInput,
    label,
    showPasswordToggle,
    validationInternal,
    validationMessageInternal,
  } = parameters

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [internalValidation, setInternalValidation] = useState({
    isValid: true,
    validationMessage: validationMessageInternal,
  })
  const [masked, setMasked] = useState(maskedInput === undefined ? true : maskedInput)

  // Reset saved value when re-loading form (since password can't be stored)
  useEffect(() => {
    if (value !== undefined) {
      onSave({ hash: '', text: '', customValidation: { isValid: null } })
    }
  }, [])

  async function handleChange(e: any) {
    if (e.target.name === 'password') {
      setPassword(e.target.value)
      const responses = { thisResponse: password || '' }
      const customValidation = await validate(validationInternal, validationMessageInternal, {
        objects: { responses },
      })
      setInternalValidation(customValidation)
    } else setPasswordConfirm(e.target.value)
  }

  async function handleLoseFocus(e: any) {
    const responses = { thisResponse: password || '' }
    const customValidation = await validate(validationInternal, validationMessageInternal, {
      objects: { responses },
    })
    setInternalValidation(customValidation)
    const passwordsMatch = password === passwordConfirm
    const hash = customValidation.isValid && passwordsMatch ? await createHash(password) : ''

    onSave({
      hash,
      text: hash !== '' ? '•••••••' : '',
      customValidation,
    })
  }

  return (
    <>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      <Form.Input
        name="password"
        fluid
        placeholder={placeholder ? placeholder : 'Enter password'}
        onChange={handleChange}
        onBlur={handleLoseFocus}
        onFocus={setIsActive}
        value={password ? password : ''}
        disabled={!isEditable}
        type={masked ? 'password' : undefined}
        error={
          !internalValidation.isValid && validationState.isValid !== null
            ? {
                content: validationMessageInternal,
                pointing: 'above',
              }
            : null
        }
      />
      <Form.Input
        name="passwordConfirm"
        fluid
        placeholder={confirmPlaceholder ? confirmPlaceholder : 'Confirm password'}
        onChange={handleChange}
        onBlur={handleLoseFocus}
        onFocus={setIsActive}
        value={passwordConfirm ? passwordConfirm : ''}
        disabled={!isEditable}
        type={masked ? 'password' : undefined}
        error={
          passwordConfirm !== password && passwordConfirm !== ''
            ? {
                content: 'Passwords do not match',
                pointing: 'above',
              }
            : null
        }
      />
      <Form.Field required={false}>
        {(showPasswordToggle === undefined ? true : showPasswordToggle) && (
          <Checkbox label="Show password" checked={!masked} onClick={() => setMasked(!masked)} />
        )}
      </Form.Field>
    </>
  )
}

export default ApplicationView

const createHash = async (password: string) => {
  try {
    const response = await fetch(config.serverREST + '/create-hash', {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })
    const output = await response.json()
    return output.hash
  } catch (err) {
    throw err
  }
}
