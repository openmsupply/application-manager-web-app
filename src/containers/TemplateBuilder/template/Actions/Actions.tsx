import React, { createContext, useContext } from 'react'
import { useEffect, useState } from 'react'
import { Header } from 'semantic-ui-react'
import { Loading } from '../../../../components'

import {
  ActionPlugin,
  TemplateAction,
  Trigger,
  useGetAllActionsQuery,
} from '../../../../utils/generated/graphql'
import CheckboxIO from '../../shared/CheckboxIO'
import DropdownIO from '../../shared/DropdownIO'
import { EvaluationHeader } from '../../shared/Evaluation'
import { IconButton } from '../../shared/IconButton'
import { useOperationState } from '../../shared/OperationContext'
import TextIO from '../../shared/TextIO'
import { stringSort } from '../Permissions/PermissionNameInfo/PermissionNameInfo'
import { disabledMessage, useTemplateState } from '../TemplateWrapper'
import TriggerDisplay from './TriggerDisplay'

type ActionsByCode = { [actionCode: string]: ActionPlugin }

type ActionContext = {
  allActionsByCode: ActionsByCode
}

const Context = createContext<ActionContext>({ allActionsByCode: {} })

const ActionsWrapper: React.FC = () => {
  const [state, setState] = useState<ActionContext | null>(null)
  const { data } = useGetAllActionsQuery()

  useEffect(() => {
    const allActions = data?.actionPlugins?.nodes
    if (!allActions) return
    const allActionsByCode: ActionsByCode = {}

    allActions.forEach((actionPlugin) => {
      if (!actionPlugin) return
      allActionsByCode[String(actionPlugin?.code)] = actionPlugin as ActionPlugin
    })

    setState({ allActionsByCode })
  }, [data])

  if (!state) return <Loading />

  return (
    <Context.Provider value={state}>
      <Actions />
    </Context.Provider>
  )
}

export const useActionState = () => useContext(Context)

const Actions: React.FC = () => {
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null)
  const [usedTriggers, setUsedTrigger] = useState<Trigger[]>([])
  const {
    actions,
    template: { isDraft },
  } = useTemplateState()

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

export default ActionsWrapper
