import React, { useState, useEffect } from 'react'
import { Form, Checkbox } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import config from '../../../config.json'
import { useUserState } from '../../../contexts/UserState'
import strings from '../constants'

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  value,
  setIsActive,
  onSave,
  Markdown,
  validate,
  applicationData,

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
  const [state, setState] = useState({ password: '', passwordConfirmation: '' })
  const [errors, setErrors] = useState({ password: '', passwordConfirmation: '' })
  const [masked, setMasked] = useState(maskedInput === undefined ? true : maskedInput)

  // Reset saved value when re-loading form (since password can't be stored)
  useEffect(() => {
    if (value !== undefined) {
      onSave({ hash: '', text: '', customValidation: { isValid: null } })
    }
  }, [])

  const setPasswords =
    (type: 'password' | 'passwordConfirmation') =>
    (_: any, { value }: { value: string }) => {
      setState({ ...state, [type]: value })
      setErrors({ ...errors, [type]: '' })
    }

  async function handleLoseFocus(type: 'password' | 'passwordConfirmation') {
    let isPasswordValid = !errors.password

    if (type === 'password') {
      const responses = { thisResponse: state.password || '', ...allResponses }
      const customValidation = await validate(validationInternal, validationMessageInternal, {
        objects: { responses, currentUser, applicationData },
        APIfetch: fetch,
        graphQLConnection: { fetch: fetch.bind(window), endpoint: config.serverGraphQL },
      })

      isPasswordValid = customValidation.isValid
      if (!isPasswordValid) setErrors({ ...errors, password: validationMessageInternal })
    }

    let isConfirmationMatching = true
    const isConfirmationEmpty = !state.passwordConfirmation

    if (requireConfirmation) {
      isConfirmationMatching = state.password === state.passwordConfirmation
      if (!isConfirmationMatching && !isConfirmationEmpty)
        setErrors({ ...errors, passwordConfirmation: strings.ALERT_PASSWORDS_DONT_MATCH })
    }

    const isValid = isConfirmationMatching && isPasswordValid
    console.log(isValid, isConfirmationMatching, isPasswordValid)
    if (isValid) {
      const hash = await createHash(state.password)
      onSave({ hash, customValidation: isValid, text: '********' })
    } else {
      onSave({ customValidation: isValid })
    }
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
        onChange={setPasswords('password')}
        onBlur={() => handleLoseFocus('password')}
        onFocus={setIsActive}
        value={state.password}
        disabled={!isEditable}
        type={masked ? 'password' : undefined}
        error={errors.password || null}
      />
      {requireConfirmation && (
        <Form.Input
          name="passwordConfirm"
          fluid
          placeholder={
            confirmPlaceholder ? confirmPlaceholder : strings.PLACEHOLDER_CONFIRM_DEFAULT
          }
          onChange={setPasswords('passwordConfirmation')}
          onBlur={() => handleLoseFocus('passwordConfirmation')}
          onFocus={setIsActive}
          value={state.passwordConfirmation}
          disabled={!isEditable}
          type={masked ? 'password' : undefined}
          error={errors.passwordConfirmation || null}
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
