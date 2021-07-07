import { truncate } from 'lodash'
import React, { useEffect, useState } from 'react'
import ReactJson from 'react-json-view'
import {
  Label,
  Input,
  Icon,
  Popup,
  Button,
  Form,
  TextArea,
  Dropdown,
  Accordion,
  Checkbox,
  Header,
} from 'semantic-ui-react'
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic'
import config from '../../../config'
import { useUserState } from '../../../contexts/UserState'
import { EvaluatorNode, FullStructure } from '../../../utils/types'
import { parseAndRenderEvaluation } from '../evaluatorGui/renderEvaluation'
import semanticComponentLibrary from '../evaluatorGui/semanticComponentLibrary'
import { getTypedEvaluation, getTypedEvaluationAsString } from '../evaluatorGui/typeHelpers'

type TextIOprops = {
  text?: string
  title?: string
  setText?: (text: string, resetValue: (text: string) => void) => void
  disabled?: boolean
  disabledMessage?: string
  icon?: string
  color?: string
  link?: string
  isTextArea?: boolean
  isPropUpdated?: boolean
  textAreaDefaulRows?: number
}

const getDefaultRows = (text: string, textAreaDefaulRows: number) => {
  const rowsInText = text.match(/[\n]/g)?.length || 0
  return rowsInText === 0 ? textAreaDefaulRows : rowsInText + 2
}

const TextIO: React.FC<TextIOprops> = ({
  text = '',
  setText,
  disabled = false,
  title = '',
  icon,
  disabledMessage,
  color,
  link,
  isTextArea = false,
  textAreaDefaulRows = 4,
  isPropUpdated = false,
}) => {
  const [defaultRows] = useState(getDefaultRows(text, textAreaDefaulRows))
  const [innerValue, setInnerValue] = useState(text)
  const style = color ? { color } : {}

  const renderText = () => {
    if (setText) return null

    return <div className="text-io-component value">{text}</div>
  }

  const renderInput = () => {
    if (!setText) return null

    if (isTextArea) {
      return (
        <div className="text-io-component value">
          <Form>
            <TextArea
              disabled={disabled}
              value={innerValue}
              rows={defaultRows}
              onBlur={() => setText(innerValue, setInnerValue)}
              onChange={(_, { value }) => {
                setInnerValue(String(value))
              }}
            />
          </Form>
        </div>
      )
    }

    return (
      <Input
        value={innerValue}
        disabled={disabled}
        className="text-io-component value"
        size="small"
        onChange={(_, { value }) => {
          setInnerValue(value)
        }}
        // Dont' want to try and query api on every key change of query text
        onBlur={() => setText(innerValue, setInnerValue)}
      />
    )
  }

  const renderLabel = () => {
    if (link) {
      return (
        <div style={style} className="text-io-component key">
          <a style={style} target="_blank" href={link}>
            {title} {icon && <Icon style={style} name={icon as SemanticICONS} />}
          </a>
        </div>
      )
    }
    return (
      <div style={style} className="text-io-component key">
        {title} {icon && <Icon style={style} name={icon as SemanticICONS} />}
      </div>
    )
  }

  return (
    <Popup
      content={disabledMessage}
      disabled={!disabled || !disabledMessage}
      trigger={
        <div className="text-io-wrapper">
          {renderLabel()}
          {renderText()}
          {renderInput()}
        </div>
      }
    />
  )
}

type StringOrNumber = number | string
type GetterOrKey = ((row: any) => StringOrNumber) | string

type DropdownIOprops = {
  value: StringOrNumber
  title?: string
  setValue?: (
    value: StringOrNumber,
    fullValue: any,
    resetValue: (value: StringOrNumber) => void
  ) => void
  disabled?: boolean
  disabledMessage?: string
  link?: string
  isPropUpdated?: boolean
  options?: any[]
  getKey: GetterOrKey
  getValue: GetterOrKey
  getText: GetterOrKey
}

const defaultGetters: GetterOrKey = (row) => String(row)

const getterOrKeyHelper = (getterOrKey: GetterOrKey, value: any) => {
  try {
    if (typeof getterOrKey === 'function') return getterOrKey(value)
    if (typeof getterOrKey === 'string') return value[getterOrKey]
  } catch (e) {
    console.log(e)
    return 'cant resolve row'
  }
}

const DropdownIO: React.FC<DropdownIOprops> = ({
  value,
  setValue,
  disabled = false,
  title = '',
  disabledMessage,
  link,
  isPropUpdated = false,
  options = [],
  getKey = defaultGetters,
  getValue = defaultGetters,
  getText = defaultGetters,
}) => {
  const [innerValue, setInnerValue] = useState(value)

  const renderText = () => {
    if (setValue) return null

    return <div className="text-io-component value">{value}</div>
  }

  const renderDropdown = () => {
    if (!setValue) return null

    return (
      <Dropdown
        value={innerValue}
        disabled={disabled}
        className="text-io-component value"
        options={options.map((value) => ({
          text: getterOrKeyHelper(getText, value),
          key: getterOrKeyHelper(getKey, value),
          value: getterOrKeyHelper(getValue, value),
        }))}
        size="small"
        onChange={(_, { value }) => {
          if (typeof value !== 'string' && typeof value !== 'number') return
          setInnerValue(value)
          const fullValue = options.find((_value) => value === getterOrKeyHelper(getValue, _value))
          setValue(value, fullValue, setInnerValue)
        }}
      />
    )
  }

  const renderLabel = () => {
    if (link) {
      return (
        <div className="text-io-component key">
          <a target="_blank" href={link}>
            {title}
          </a>
        </div>
      )
    }
    return <div className="text-io-component key">{title}</div>
  }

  return (
    <Popup
      content={disabledMessage}
      disabled={!disabled || !disabledMessage}
      trigger={
        <div className="text-io-wrapper">
          {renderLabel()}
          {renderText()}
          {renderDropdown()}
        </div>
      }
    />
  )
}

type ButtonWithFallbackProps = {
  onClick: () => void
  title: string
  disabled?: boolean
  disabledMessage?: string
}

const ButtonWithFallback: React.FC<ButtonWithFallbackProps> = ({
  onClick,
  title,
  disabled = false,
  disabledMessage,
}) => (
  <Popup
    content={disabledMessage}
    disabled={!disabled || !disabledMessage}
    trigger={
      <div>
        <Button inverted primary size="tiny" disabled={disabled} onClick={onClick}>
          {title}
        </Button>
      </div>
    }
  />
)

const JsonIO: React.FC<{
  initialValue: object
  label: string
  update: (value: object) => void
  isPropUpdated?: boolean
}> = ({ initialValue, update, label, isPropUpdated = false }) => {
  const [isError, setIsError] = useState(false)

  const getInitialValue = () => {
    try {
      return JSON.stringify(initialValue, null, ' ')
    } catch (e) {
      return '{}'
    }
  }
  const [value, setValue] = useState(getInitialValue())

  useEffect(() => {
    if (isPropUpdated) {
      setValue(getInitialValue())
    }
  }, [initialValue])

  const tryToSetValue = (value: string) => {
    try {
      const parseValue = JSON.parse(value)
      update(parseValue)
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

const iconLink = 'https://react.semantic-ui.com/elements/icon/'

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

export const Parameters: React.FC<{
  parameters: any
  currentElementCode: string
  setParameters: (evaluation: object) => void
  fullStructure?: FullStructure
}> = ({ parameters, setParameters, currentElementCode, fullStructure }) => {
  const [asGui, setAsGui] = useState(true)
  const [isActive, setIsActive] = useState(false)

  return (
    <Accordion style={{ borderRadius: 7, border: '2px solid black', padding: 2, margin: 5 }}>
      <Accordion.Title
        className="evaluation-container-title"
        style={{ padding: 2, justifyContent: 'center', alignItems: 'center' }}
        active={isActive}
        onClick={() => setIsActive(!isActive)}
      >
        <Header as="h3" style={{ margin: 0 }}>
          {`Parameters (${parameters ? Object.values(parameters).length : 0})`}
        </Header>
        <Icon size="large" style={{ margin: 0 }} name={isActive ? 'angle up' : 'angle down'} />
      </Accordion.Title>
      <Accordion.Content active={isActive}>
        <div className="flex-column" style={{ alignItems: 'center' }}>
          <div className="flex-row">
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 7,
                padding: 3,
                margin: 3,
                background: '#E8E8E8',
              }}
            >
              <Label style={{ whiteSpace: 'nowrap', margin: 3, marginRight: 2 }}>Show As GUI</Label>

              <Checkbox
                checked={asGui}
                toggle
                size="small"
                onChange={() => {
                  setAsGui(!asGui)
                }}
              />
            </div>
            {asGui && (
              <Button
                primary
                inverted
                onClick={() => {
                  setParameters({ ...parameters, newParameter: null })
                }}
              >
                Add Parameter
              </Button>
            )}
          </div>
          {!asGui && (
            <JsonIO
              key="elementParameters"
              isPropUpdated={true}
              initialValue={parameters}
              label=""
              update={(value: object) => setParameters(value)}
            />
          )}

          {asGui &&
            Object.entries(parameters)
              .sort(([key1], [key2]) => (key1 > key2 ? -1 : key1 === key2 ? 0 : 1))
              .map(([key, value]) => (
                <EvaluationContainer
                  setEvaluation={(value: any) =>
                    setParameters({ ...parameters, [key]: value?.value || value })
                  }
                  updateKey={(newKey) => {
                    const newParameters = { ...parameters }
                    delete newParameters[key]
                    setParameters({ ...newParameters, [newKey]: value })
                  }}
                  deleteKey={() => {
                    const newParameters = { ...parameters }
                    delete newParameters[key]
                    setParameters(newParameters)
                  }}
                  key={key}
                  evaluation={value}
                  currentElementCode={currentElementCode}
                  fullStructure={fullStructure}
                  label={key}
                />
              ))}
        </div>
      </Accordion.Content>
    </Accordion>
  )
}

type IconButtonProps = {
  disabledMessage?: string
  disabled?: boolean
  name: SemanticICONS
  onClick: () => void
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  onClick,
  disabledMessage,
  disabled = false,
}) => (
  <Popup
    content={disabledMessage}
    disabled={!disabled || !disabledMessage}
    trigger={
      <Icon
        className={`icon-button ${disabled ? '' : 'clickable'}`}
        name={name}
        onClick={() => (disabled ? console.log('action disable') : onClick())}
      />
    }
  />
)

export const EvaluationContainer: React.FC<{
  evaluation: any
  currentElementCode: string
  setEvaluation: (evaluation: object) => void
  fullStructure?: FullStructure
  label: string
  updateKey?: (key: string) => void
  deleteKey?: () => void
}> = ({
  evaluation,
  setEvaluation,
  label,
  currentElementCode,
  fullStructure,
  updateKey,
  deleteKey,
}) => {
  const {
    userState: { currentUser },
  } = useUserState()
  const [isActive, setIsActive] = useState(false)
  const [asGui, setAsGui] = useState(true)
  const objects = {
    responses: {
      ...fullStructure?.responsesByCode,
      thisResponse: fullStructure?.responsesByCode?.[currentElementCode]?.text,
    },
    currentUser,
    applicationData: fullStructure?.info,
  }

  const typedEvaluation = getTypedEvaluation(evaluation)

  return (
    <Accordion style={{ borderRadius: 7, border: '1px solid black', padding: 2, margin: 5 }}>
      <Accordion.Title
        className="evaluation-container-title"
        style={{ justifyContent: 'center', padding: 2 }}
        active={isActive}
      >
        {!updateKey && <Label>{label}</Label>}
        {deleteKey && <Icon className="clickable" onClick={deleteKey} />}
        <div className="config-reduced-width-input">
          {updateKey &&
            semanticComponentLibrary.TextInput({
              text: label,
              setText: updateKey,
              title: 'Parameter Name',
            })}
        </div>
        <div className="indicators-container as-row">
          <div key="type" className="indicator">
            <Label className="key" content="type" />
            <Label className="value" content={typedEvaluation.type} />
          </div>
          {typedEvaluation.type === 'operator' && (
            <div key="operator" className="indicator">
              <Label className="key" content="operator" />
              <Label className="value" content={typedEvaluation.asOperator.operator} />
            </div>
          )}

          {typedEvaluation.type !== 'operator' && (
            <div key="value" className="indicator">
              <Label className="key" content="value" />
              <Label
                className="value"
                content={truncate(getTypedEvaluationAsString(typedEvaluation), { length: 80 })}
              />
            </div>
          )}
        </div>
        <Icon
          size="large"
          name={isActive ? 'angle up' : 'angle down'}
          onClick={() => setIsActive(!isActive)}
        />
      </Accordion.Title>
      <Accordion.Content active={isActive}>
        {isActive && (
          <div
            className="flex-row"
            style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 7,
                  padding: 3,
                  margin: 3,
                  background: '#E8E8E8',
                }}
              >
                <Label style={{ whiteSpace: 'nowrap', margin: 3, marginRight: 2 }}>
                  Show As GUI
                </Label>

                <Checkbox
                  checked={asGui}
                  toggle
                  size="small"
                  onChange={() => {
                    setAsGui(!asGui)
                  }}
                />
              </div>
              {!asGui && (
                <JsonIO
                  key="elementParameters"
                  isPropUpdated={true}
                  initialValue={evaluation}
                  label="Plugin Parameters"
                  update={(value: object) => setEvaluation(value)}
                />
              )}
              {asGui &&
                parseAndRenderEvaluation(
                  evaluation,
                  (evaltionAsString: string) => setEvaluation(asObjectOrValue(evaltionAsString)),
                  semanticComponentLibrary,
                  {
                    objects,

                    APIfetch: fetch,
                    graphQLConnection: {
                      fetch: fetch.bind(window),
                      endpoint: config.serverGraphQL,
                    },
                  }
                )}
            </div>
            {fullStructure && (
              <div
                style={{
                  marginLeft: 10,
                  borderRadius: 7,
                  border: '2px solid #E8E8E8',
                  overflow: 'auto',
                  maxHeight: '600px',
                  minHeight: 200,
                  maxWidth: '50%',
                }}
              >
                <Label>Object Properties</Label>

                <ReactJson src={objects} collapsed={2} />
              </div>
            )}
          </div>
        )}
      </Accordion.Content>
    </Accordion>
  )
}
const asObjectOrValue = (value: string) => {
  try {
    return JSON.parse(value)
  } catch (e) {
    return { value: value }
  }
}

export const asObject = (value: EvaluatorNode) =>
  typeof value === 'object' && value !== null
    ? value
    : { value: value || (value === false ? false : null) }

export { iconLink, TextIO, ButtonWithFallback, JsonIO, DropdownIO }
