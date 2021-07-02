import { EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'
import { truncate } from 'lodash'
import React, { useEffect, useState } from 'react'
import {
  Accordion,
  Button,
  Checkbox,
  Dropdown,
  Header,
  Icon,
  Label,
  Modal,
} from 'semantic-ui-react'
import {
  ActionPlugin,
  TemplateAction,
  TemplateStatus,
  Trigger,
  useGetAllActionsQuery,
  useGeTemplateActionByCodeQuery,
  useUpdateTemplateMutation,
} from '../../../utils/generated/graphql'
import semanticComponentLibrary from '../evaluatorGui/semanticComponentLibrary'
import { asObject, EvaluationContainer, Parameters } from './Form'
import { mutate } from './Permissions'
import { TemplateInfo } from './TemplateWrapper'

type Error = { message: string; error: string }

const Actions: React.FC<{ templateInfo: TemplateInfo }> = ({ templateInfo }) => {
  const [newSelectedTrigger, setNewSelectedTrigger] = useState('')
  const [usedTriggers, setUsedTrigger] = useState<string[]>([])
  const [error, setError] = useState<Error | null>(null)

  const { data } = useGetAllActionsQuery()
  const templateId = templateInfo?.id || 0

  const allActions = data?.actionPlugins?.nodes || []
  const isEditable = templateInfo?.status === TemplateStatus.Draft
  const allTriggers = Object.values(Trigger)
  const actions = templateInfo?.templateActions?.nodes || []

  useEffect(() => {
    const newUsedTriggers = [...usedTriggers]
    actions.forEach((action) => {
      if (newUsedTriggers.includes(action?.trigger || '')) return
      newUsedTriggers.push(action?.trigger || '')
    })
    setUsedTrigger(newUsedTriggers)
  }, [])

  const availableTriggers = allTriggers.filter((trigger) => !usedTriggers.includes(trigger))

  return (
    <div className="template-config-actions">
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Header as="h2" style={{ margin: 0, marginRight: 10 }}>
          Triggers
        </Header>
        <Dropdown
          value={newSelectedTrigger}
          selection
          disabled={!isEditable}
          onChange={(_, { value }) => setNewSelectedTrigger(String(value))}
          options={availableTriggers.map((trigger) => ({
            key: trigger,
            text: trigger,
            value: trigger,
          }))}
        />
        <Icon
          className="clickable"
          name="add"
          style={{ marginLeft: 5 }}
          onClick={async () => {
            if (!isEditable) return
            if (!newSelectedTrigger) if (usedTriggers.includes(newSelectedTrigger)) return

            setUsedTrigger([...usedTriggers, newSelectedTrigger])
            setNewSelectedTrigger('')
          }}
        />
      </div>

      {usedTriggers.map((trigger) => (
        <TriggerDisplay
          actions={actions as TemplateAction[]}
          allActions={allActions as ActionPlugin[]}
          isEditable={isEditable}
          setError={setError}
          templateId={templateId}
          trigger={trigger}
        />
      ))}
      <Modal open={!!error} onClick={() => setError(null)} onClose={() => setError(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Label size="large" color="red">
            {String(error?.message)}
            <Icon name="close" onClick={() => setError(null)} />
          </Label>
          <div style={{ margin: 20 }}>{String(error?.error)}</div>
        </div>
      </Modal>
    </div>
  )
}

const TriggerDisplay: React.FC<{
  trigger: string
  allActions: ActionPlugin[]
  setError: (error: Error) => void
  actions: TemplateAction[]
  isEditable: boolean
  templateId: number
}> = ({ setError, templateId, isEditable, trigger, actions, allActions }) => {
  const [newSelectedAction, setNewSelectedAction] = useState('')
  const [updateTemplate] = useUpdateTemplateMutation()

  const triggerActions = actions.filter((action) => action?.trigger === trigger)
  const sequantialActions = triggerActions.filter((action) => action?.sequence !== null)
  const asyncrhonousActions = triggerActions.filter((action) => action?.sequence === null)
  return (
    <div key="trigger">
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Header as="h4" style={{ margin: 0, marginRight: 10 }}>
          {trigger}
        </Header>
        <Dropdown
          value={newSelectedAction}
          selection
          disabled={!isEditable}
          onChange={(_, { value }) => setNewSelectedAction(String(value))}
          options={allActions.map((action) => ({
            key: action?.code || '',
            text: action?.code || '',
            value: action?.code || '',
          }))}
        />

        <Icon
          className="clickable"
          name="add"
          style={{ marginLeft: 5 }}
          onClick={async () => {
            if (!isEditable) return
            if (!newSelectedAction) return

            const newAction = allActions.find((action) => action?.code === newSelectedAction)

            setNewSelectedAction('')

            const lastIndex = triggerActions.reduce(
              (max, action) => (max > (action?.sequence || 0) ? max : action?.sequence || 0),
              0
            )

            await mutate(
              () =>
                updateTemplate({
                  variables: {
                    id: templateId,
                    templatePatch: {
                      templateActionsUsingId: {
                        create: [
                          {
                            actionCode: newAction?.code,
                            condition: true,
                            trigger: trigger as Trigger,
                            parameterQueries: {},
                            sequence: lastIndex + 1,
                          },
                        ],
                      },
                    },
                  },
                }),
              setError
            )
          }}
        />
      </div>
      {sequantialActions.length > 0 && (
        <React.Fragment key="sequantial">
          <div key="sequantial" className="flex-row" style={{ justifyContent: 'center' }}>
            <Header as="h5">Sequantial</Header>
          </div>
          {sequantialActions.map((action) => (
            <Action
              actions={sequantialActions}
              action={action}
              allActions={allActions}
              isEditable={isEditable}
              templateId={templateId}
              setError={setError}
            />
          ))}
        </React.Fragment>
      )}
      {asyncrhonousActions.length > 0 && (
        <React.Fragment key="sequantial">
          <div key="async" className="flex-row" style={{ justifyContent: 'center' }}>
            <Header as="h5">Asynchronous</Header>
          </div>
          {asyncrhonousActions.map((action) => (
            <Action
              actions={sequantialActions}
              allActions={allActions}
              action={action}
              isEditable={isEditable}
              templateId={templateId}
              setError={setError}
            />
          ))}
        </React.Fragment>
      )}
    </div>
  )
}

const Action: React.FC<{
  action: TemplateAction
  actions: TemplateAction[]
  allActions: ActionPlugin[]
  isEditable: boolean
  templateId: number
  setError: (error: Error) => void
}> = ({ action, actions, isEditable, templateId, setError, allActions }) => {
  const [updateTemplate] = useUpdateTemplateMutation()
  const [isOpen, setIsOpen] = useState(false)
  const [updateState, setUpdateState] = useState(action)

  const [existingElementState, setExistingElementState] = useState<{
    isSearching: boolean
    pluginCode: string
    options: {
      text: string
      key: number
      value?: number
      valueFull?: {
        description: string
        condition: EvaluatorNode
        parameterQueries: object
      }
    }[]
  }>({
    isSearching: false,
    pluginCode: '',
    options: [],
  })

  const { data: actionSearchData } = useGeTemplateActionByCodeQuery({
    skip: !existingElementState.isSearching,
    variables: { pluginCode: existingElementState.pluginCode },
  })

  useEffect(() => {
    const newState = { isSearching: false }
    if (
      existingElementState.isSearching &&
      (!actionSearchData?.templateActions?.nodes ||
        actionSearchData.templateActions?.nodes.length === 0)
    )
      return setExistingElementState({
        ...existingElementState,
        ...newState,
        options: [{ text: 'No existing matching template elements found', key: -2 }],
      })

    if (!actionSearchData?.templateActions?.nodes) return

    const newOptions = actionSearchData.templateActions?.nodes.map((action) => ({
      text: `${action?.template?.code} - ${action?.trigger} - ${truncate(
        action?.description || '',
        { length: 10 }
      )}`,
      key: action?.id || 0,
      value: action?.id || 0,
      valueFull: {
        condition: action?.condition || true,
        description: action?.description || '',
        parameterQueries: action?.parameterQueries || {},
      },
    }))

    setExistingElementState({
      ...existingElementState,
      ...newState,
      options: newOptions,
    })
  }, [actionSearchData])

  const lastIndex = actions.reduce(
    (max, action) => (max > (action?.sequence || 0) ? max : action?.sequence || 0),
    action.sequence || 0
  )

  const firstIndex = actions.reduce(
    (min, action) => (min < (action?.sequence || 0) ? min : action?.sequence || 0),
    action.sequence || 0
  )

  const index = actions.map((seachAction) => seachAction.id).indexOf(action.id)

  return (
    <div key={action.id}>
      <Accordion
        style={{ borderRadius: 7, border: '1px solid rgba(0,0,0,0.3)', padding: 3, margin: 5 }}
      >
        <Accordion.Title style={{ justifyContent: 'center', padding: 2 }} active={isOpen}>
          <div className="indicators-container as-row" style={{ justifyContent: 'flex-start' }}>
            {action.sequence !== null && (
              <>
                {firstIndex !== action?.sequence && (
                  <Icon
                    name={'angle up'}
                    style={{ lineHeight: 'normal' }}
                    onClick={() => {
                      if (!isEditable) return

                      const previousAction = actions[index - 1]
                      if (!previousAction) return

                      mutate(
                        () =>
                          updateTemplate({
                            variables: {
                              id: templateId,
                              templatePatch: {
                                templateActionsUsingId: {
                                  updateById: [
                                    {
                                      id: action?.id,
                                      patch: { sequence: previousAction.sequence },
                                    },
                                    {
                                      id: previousAction?.id,
                                      patch: { sequence: action.sequence },
                                    },
                                  ],
                                },
                              },
                            },
                          }),
                        setError
                      )
                    }}
                  />
                )}
                {lastIndex !== action?.sequence && (
                  <Icon
                    name={'angle down'}
                    style={{ lineHeight: 'normal' }}
                    onClick={() => {
                      if (!isEditable) return

                      const nextAction = actions[index + 1]
                      if (!nextAction) return

                      mutate(
                        () =>
                          updateTemplate({
                            variables: {
                              id: templateId,
                              templatePatch: {
                                templateActionsUsingId: {
                                  updateById: [
                                    {
                                      id: action?.id,
                                      patch: { sequence: nextAction.sequence },
                                    },
                                    {
                                      id: nextAction?.id,
                                      patch: { sequence: action.sequence },
                                    },
                                  ],
                                },
                              },
                            },
                          }),
                        setError
                      )
                    }}
                  />
                )}
              </>
            )}
            <div key="code" className="indicator">
              <Label className="key" content="code" />
              <Label className="value" content={action?.actionCode} />
            </div>
            {action?.description && (
              <div key="description" className="indicator">
                <Label className="key" content="description" />
                <Label className="value" content={action?.description || ''} />
              </div>
            )}

            <Icon
              size="large"
              name={isOpen ? 'angle up' : 'angle down'}
              style={{ lineHeight: 'normal' }}
              onClick={() => setIsOpen(!isOpen)}
            />
            <div style={{ flexGrow: 1 }}></div>
            <Icon
              name={'delete'}
              onClick={() => {
                if (!isEditable) return
                mutate(
                  () =>
                    updateTemplate({
                      variables: {
                        id: templateId,
                        templatePatch: {
                          templateActionsUsingId: {
                            deleteById: [{ id: action?.id }],
                          },
                        },
                      },
                    }),
                  setError
                )
              }}
              style={{ lineHeight: 'normal' }}
            />
          </div>
        </Accordion.Title>
        <Accordion.Content active={isOpen}>
          {!isOpen && null}
          {isOpen && (
            <React.Fragment key="actionExpanded">
              <div
                className="flex-row"
                style={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <TextWrapper
                  title="Description"
                  text={action?.description || ''}
                  disabled={!isEditable}
                  setText={(text) => {
                    if (!isEditable) return
                    setUpdateState({ ...updateState, description: text })
                  }}
                />
                <div>
                  <div className="flex-row" style={{ alignItems: 'center' }}>
                    <Label style={{ whiteSpace: 'nowrap', margin: 3, marginRight: 2 }}>
                      sequantial
                    </Label>

                    <Checkbox
                      checked={action.sequence !== null}
                      toggle
                      size="small"
                      disabled={!isEditable}
                      onChange={() => {
                        let newSequance: number | null = null
                        if (action.sequence === null) {
                          newSequance = lastIndex + 1
                        }
                        setIsOpen(false)
                        mutate(
                          () =>
                            updateTemplate({
                              variables: {
                                id: templateId,
                                templatePatch: {
                                  templateActionsUsingId: {
                                    updateById: [
                                      {
                                        patch: {
                                          sequence: newSequance,
                                        },
                                        id: action?.id,
                                      },
                                    ],
                                  },
                                },
                              },
                            }),
                          setError
                        )
                      }}
                    />
                  </div>
                </div>
                <Dropdown
                  style={{ margin: 4 }}
                  text="From Existing"
                  search
                  selection
                  icon="search"
                  onClick={() => {
                    setExistingElementState({
                      isSearching: true,
                      pluginCode: updateState.actionCode || '',
                      options: [{ text: 'Loading', key: -1 }],
                    })
                  }}
                  options={existingElementState.options}
                  onChange={(_, { value }) => {
                    const selected = existingElementState.options.find(
                      (option) => option?.value === value
                    )

                    if (selected?.valueFull)
                      setUpdateState({ ...updateState, ...selected.valueFull })
                  }}
                />
              </div>
              <div key="condition" className="white-child">
                <EvaluationContainer
                  key="condition"
                  label="condition"
                  currentElementCode={''}
                  evaluation={asObject(updateState.condition)}
                  setEvaluation={(value: object) => {
                    if (!isEditable) return
                    setUpdateState({ ...updateState, condition: value })
                  }}
                />
              </div>
              <div
                className="indicators-container as-row"
                style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}
              >
                <div key="requiredParameters" className="indicator">
                  <Label className="key" content="required parameters" />
                  <Label
                    className="value"
                    content={(
                      allActions.find((_action) => _action.code === action.actionCode)
                        ?.requiredParameters || []
                    ).join(',')}
                  />
                </div>
                <div key="optionalParameters" className="indicator">
                  <Label className="key" content="optional parameters" />
                  <Label
                    className="value"
                    content={(
                      allActions.find((_action) => _action.code === action.actionCode)
                        ?.optionalParameters || []
                    ).join(',')}
                  />
                </div>
              </div>
              <div key="parametersElement" className="white-child">
                <Parameters
                  key="parametersElement"
                  currentElementCode={''}
                  parameters={asObject(updateState.parameterQueries)}
                  setParameters={(value: object) => {
                    if (!isEditable) return
                    setUpdateState({ ...updateState, parameterQueries: value })
                  }}
                />
              </div>
              <Button
                primary
                inverted
                style={{ alignSelf: 'flex-end' }}
                onClick={() => {
                  if (!isEditable) return
                  mutate(
                    () =>
                      updateTemplate({
                        variables: {
                          id: templateId,
                          templatePatch: {
                            templateActionsUsingId: {
                              updateById: [
                                {
                                  patch: {
                                    parameterQueries: updateState.parameterQueries,
                                    condition: updateState.condition,
                                    description: updateState.description,
                                  },
                                  id: action?.id,
                                },
                              ],
                            },
                          },
                        },
                      }),
                    setError
                  )
                }}
              >
                save
              </Button>
              <Button
                primary
                inverted
                onClick={() => {
                  setUpdateState(action)
                  setIsOpen(false)
                }}
              >
                cancel
              </Button>
            </React.Fragment>
          )}
        </Accordion.Content>
      </Accordion>
    </div>
  )
}

const TextWrapper: React.FC<{
  title: string
  text: string
  disabled: boolean
  setText: (text: string) => void
}> = ({ title, text, disabled, setText }) => (
  <div className="increased-width-input">
    {semanticComponentLibrary.TextInput({
      title,
      text,
      disabled,
      setText,
    })}
  </div>
)

export default Actions
