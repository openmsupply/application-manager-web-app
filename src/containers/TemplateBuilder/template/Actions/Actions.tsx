import React from 'react'
import { useEffect, useState } from 'react'
import { Header } from 'semantic-ui-react'

import { TemplateAction, Trigger } from '../../../../utils/generated/graphql'
import CheckboxIO from '../../shared/CheckboxIO'
import DropdownIO from '../../shared/DropdownIO'
import { EvaluationHeader } from '../../shared/Evaluation'
import { IconButton } from '../../shared/IconButton'
import { useOperationState } from '../../shared/OperationContext'
import TextIO from '../../shared/TextIO'
import { stringSort } from '../Permissions/PermissionNameInfo/PermissionNameInfo'
import { disabledMessage, useTemplateState } from '../TemplateWrapper'

type TemplateActions = { sequential: TemplateAction[]; asynchronous: TemplateAction[] }
type GetActionsForTrigger = (
  trigger: Trigger,
  allTemplateActions: TemplateAction[]
) => TemplateActions

type IsAsynchronous = (templateAction: TemplateAction) => boolean

const isAsynchronous: IsAsynchronous = (templateAction) =>
  !templateAction.sequence || templateAction?.sequence <= 0

const getActionsForTrigger: GetActionsForTrigger = (trigger, allTemplateActions) => {
  const triggerActions = allTemplateActions.filter(
    (templateAction) => templateAction.trigger === trigger
  )
  return {
    asynchronous: triggerActions.filter(isAsynchronous),
    sequential: triggerActions
      .filter((templateAction) => !isAsynchronous(templateAction))
      .sort((a1, a2) => Number(a1.sequence) - Number(a2.sequence)),
  }
}

const Actions: React.FC = () => {
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null)
  const [usedTriggers, setUsedTrigger] = useState<Trigger[]>([])
  const {
    actions,
    template: { id: templateId, isDraft },
  } = useTemplateState()
  //   const { data } = useGetAllActionsQuery()

  useEffect(() => {
    const newUsedTriggers = [...usedTriggers]
    actions.forEach((action) => {
      if (newUsedTriggers.includes(action?.trigger || Trigger.OnApplicationCreate)) return
      newUsedTriggers.push(action?.trigger || Trigger.OnApplicationCreate)
    })
    setUsedTrigger(newUsedTriggers.sort(stringSort))
  }, [])

  const allTriggers = Object.values(Trigger)
  const availableTriggers = allTriggers.filter((trigger) => !usedTriggers.includes(trigger))

  const addTrigger = () => {
    if (!selectedTrigger) return
    setUsedTrigger([...usedTriggers, selectedTrigger].sort(stringSort))
    setSelectedTrigger(null)
  }

  return (
    <div className="flew-column-start-start">
      <div className="flex-row-start-center">
        <Header as="h4" className="no-margin-no-padding">
          Triggers
        </Header>
        <DropdownIO
          title="Permission Name"
          isPropUpdated={true}
          value={String(selectedTrigger)}
          disabled={!isDraft}
          placeholder={
            availableTriggers.length === 0 ? 'All triggers are in use' : 'Select  To Add'
          }
          disabledMessage={disabledMessage}
          setValue={(trigger) => {
            setSelectedTrigger(trigger as Trigger)
          }}
          options={availableTriggers}
        />
        {selectedTrigger && (
          <IconButton
            name="add square"
            onClick={addTrigger}
            disabled={!isDraft}
            disabledMessage={disabledMessage}
          />
        )}
      </div>

      {usedTriggers.map((trigger) => (
        <TriggerDisplay key={trigger} trigger={trigger} allTemplateActions={actions} />
      ))}
    </div>
  )
}

type TriggerDisplayProps = {
  trigger: Trigger
  allTemplateActions: TemplateAction[]
}

type SetIsSequential = (id: number, isSequential: boolean) => void
type SwapSequences = (fromAction: TemplateAction, toAction: TemplateAction) => void
type RemoveAction = (id: number) => void

const newAction = {
  actionCode: 'cLog',
  description: 'new action description',
  parameterQueries: {
    message: 'new action message',
  },
}

const TriggerDisplay: React.FC<TriggerDisplayProps> = ({ trigger, allTemplateActions }) => {
  const { updateTemplate } = useOperationState()
  const {
    template: { id: templateId, isDraft },
  } = useTemplateState()
  const { sequential, asynchronous } = getActionsForTrigger(trigger, allTemplateActions)
  const lastSequence = sequential.reduce(
    (max, current) =>
      max === 0 || max < Number(current?.sequence) ? Number(current?.sequence) : max,
    0
  )
  const firstSequence = sequential.reduce(
    (min, current) =>
      min === 0 || min > Number(current?.sequence) ? Number(current?.sequence) : min,
    0
  )

  const removeAction: RemoveAction = (id) => {
    updateTemplate(templateId, {
      templateActionsUsingId: { deleteById: [{ id }] },
    })
  }

  const addAction = () => {
    updateTemplate(templateId, {
      templateActionsUsingId: { create: [{ ...newAction, trigger, sequence: lastSequence + 1 }] },
    })
  }

  const setIsSequential: SetIsSequential = (id, isSequential) => {
    updateTemplate(templateId, {
      templateActionsUsingId: {
        updateById: [{ id, patch: { sequence: isSequential ? lastSequence + 1 : null } }],
      },
    })
  }

  const swapSequences: SwapSequences = (fromAction, toAction) => {
    updateTemplate(templateId, {
      templateActionsUsingId: {
        updateById: [
          { id: fromAction?.id, patch: { sequence: toAction?.sequence } },
          { id: toAction?.id, patch: { sequence: fromAction?.sequence } },
        ],
      },
    })
  }

  const renderTemplateActions = (title: string, templateActions: TemplateAction[]) => {
    if (templateActions.length === 0) return null

    return (
      <div className="flex-column-start-start">
        <div className="spacer-10" />
        <div className="config-container">
          <Header as="h5" className="no-margin-no-padding">
            {title}
          </Header>
          {templateActions.map((templateAction, index) => (
            <div className="config-container-alternate">
              <div key={templateAction.id} className="flex-row-start-center">
                {!isAsynchronous(templateAction) && templateAction?.sequence !== firstSequence && (
                  <IconButton
                    name="angle up"
                    onClick={() => {
                      swapSequences(templateAction, templateActions[index - 1])
                    }}
                  />
                )}
                {!isAsynchronous(templateAction) && templateAction?.sequence !== lastSequence && (
                  <IconButton
                    name="angle down"
                    onClick={() => {
                      swapSequences(templateAction, templateActions[index + 1])
                    }}
                  />
                )}
                <IconButton name="setting" onClick={() => {}} />
                <div className="flex-row-start-center-wrap">
                  <TextIO title="Type" text={templateAction?.actionCode || ''} />
                  <TextIO
                    title="Description"
                    text={templateAction?.description || ''}
                    isTextArea={true}
                  />
                  <div className="config-container">
                    <div className="flex-row-start-center">
                      <Header as="h6" className="no-margin-no-padding">
                        Condition
                      </Header>
                      <EvaluationHeader evaluation={templateAction?.condition} />
                    </div>
                  </div>
                </div>
                <CheckboxIO
                  disabled={!isDraft}
                  disabledMessage={disabledMessage}
                  title="Is Sequential"
                  value={!isAsynchronous(templateAction)}
                  setValue={(isSequential) =>
                    setIsSequential(templateAction?.id || 0, isSequential)
                  }
                />
                <IconButton name="window close" onClick={() => removeAction(templateAction?.id)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-column-start-start">
      <div className="spacer-20" />
      <div className="flex-row-start-center">
        <Header as="h4" className="no-margin-no-padding">
          {trigger}
        </Header>
        <IconButton title="add new action" name="add square" onClick={addAction} />
      </div>
      {renderTemplateActions('Sequential', sequential)}
      {renderTemplateActions('Asynchronous', asynchronous)}
    </div>
  )
}

export default Actions
