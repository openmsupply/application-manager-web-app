import React, { useState, useEffect } from 'react'
import { Form, Checkbox } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import config from '../../../config'
import { useUserState } from '../../../contexts/UserState'
import strings from '../constants'

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  setIsActive,
  validationState,
  onSave,
  Markdown,
  validate,
  applicationData,
  currentResponse,
  allResponses,
}) => {
  const { isEditable } = element
  const {
    placeholder,
    description,
    confirmPlaceholder,
    maskedInput,
    label,
    requireConfirmation = true,
    showPasswordToggle,
    validationInternal,
    validationMessageInternal,
  } = parameters

  const {
    userState: { currentUser },
  } = useUserState()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [confirmationIsActive, setConfirmationIsActive] = useState(false)
  const [internalValidation, setInternalValidation] = useState({
    isValid: true,
    validationMessage: validationMessageInternal,
  })
  const [masked, setMasked] = useState(maskedInput === undefined ? true : maskedInput)

  // Reset saved value when re-loading form (since password can't be stored)
  useEffect(() => {
    if (currentResponse?.text !== undefined) {
      onSave({ hash: '', text: '', customValidation: { isValid: null } })
    }
  }, [])

  async function handleChange(e: any) {
    if (e.target.name === 'password') {
      setPassword(e.target.value)
      const responses = { thisResponse: e.target.value || '', ...allResponses }
      // Don't show error state on change if element is being use for checking existing password
      const shouldShowValidation = requireConfirmation ? currentResponse?.text === '' : false
      if (shouldShowValidation) {
        const customValidation = await validate(validationInternal, validationMessageInternal, {
          objects: { responses, currentUser, applicationData },
          APIfetch: fetch,
          graphQLConnection: { fetch: fetch.bind(window), endpoint: config.serverGraphQL },
        })
        setInternalValidation(customValidation)
      }
    } else {
      setConfirmationIsActive(true)
      setPasswordConfirm(e.target.value)
    }
  }

  async function handleLoseFocus(e: any) {
    if (e.target.name === 'passwordConfirm') setConfirmationIsActive(false)
    const responses = { thisResponse: password || '', ...allResponses }
    const customValidation = await validate(validationInternal, validationMessageInternal, {
      objects: { responses, currentUser, applicationData },
      APIfetch: fetch,
      graphQLConnection: { fetch: fetch.bind(window), endpoint: config.serverGraphQL },
    })
    setInternalValidation(customValidation)
    const passwordsMatch = password === passwordConfirm
    const hash = customValidation.isValid && passwordsMatch ? await createHash(password) : ''

    onSave({
      hash,
      text: hash !== '' || requireConfirmation === false ? '•••••••' : '',
      customValidation,
    })
  }

  return (
    <>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      <Markdown text={description} />
      <Form.Input
        name="password"
        fluid
        placeholder={placeholder ? placeholder : strings.PLACEHOLDER_DEFAULT}
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
      {requireConfirmation && (
        <Form.Input
          name="passwordConfirm"
          fluid
          placeholder={
            confirmPlaceholder ? confirmPlaceholder : strings.PLACEHOLDER_CONFIRM_DEFAULT
          }
          onChange={handleChange}
          onBlur={handleLoseFocus}
          onFocus={setIsActive}
          value={passwordConfirm ? passwordConfirm : ''}
          disabled={!isEditable}
          type={masked ? 'password' : undefined}
          error={
            passwordConfirm !== password && passwordConfirm !== '' && !confirmationIsActive
              ? {
                  content: strings.ALERT_PASSWORDS_DONT_MATCH,
                  pointing: 'above',
                }
              : null
          }
        />
      )}
      <Form.Field required={false}>
        {(showPasswordToggle === undefined ? true : showPasswordToggle) && (
          <Checkbox
            label={strings.LABEL_SHOW_PASSWORD}
            checked={!masked}
            onClick={() => setMasked(!masked)}
          />
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
