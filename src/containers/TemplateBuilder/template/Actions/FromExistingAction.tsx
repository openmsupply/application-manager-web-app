import { EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'
import React from 'react'
import { useEffect, useState } from 'react'
import { Dropdown } from 'semantic-ui-react'
import { useGeTemplateActionByCodeQuery } from '../../../../utils/generated/graphql'
import { ParametersType } from '../../shared/Parameters'

type ExistingAction = {
  description: string
  condition: EvaluatorNode
  parameterQueries: ParametersType
}

type FromExistingActionState = {
  isSearching: boolean
  pluginCode: string
  options: {
    text: string
    key: number
    value?: number
    valueFull?: ExistingAction
  }[]
}

type FromExistingActionProps = {
  pluginCode: string
  setTemplateAction: (existingAction: ExistingAction) => void
}

const FromExistingAction: React.FC<FromExistingActionProps> = ({
  pluginCode,
  setTemplateAction,
}) => {
  const [actionTemplateState, setActionTemplateState] = useState<FromExistingActionState>({
    isSearching: false,
    pluginCode: '',
    options: [],
  })
  const { data: actionSearchData } = useGeTemplateActionByCodeQuery({
    skip: !actionTemplateState.isSearching,
    variables: { pluginCode: actionTemplateState.pluginCode },
  })

  useEffect(() => {
    const newState = { isSearching: false }
    if (
      actionTemplateState.isSearching &&
      (!actionSearchData?.templateActions?.nodes ||
        actionSearchData.templateActions?.nodes.length === 0)
    )
      return setActionTemplateState({
        ...actionTemplateState,
        ...newState,
        options: [{ text: 'No existing matching template elements found', key: -2 }],
      })

    if (!actionSearchData?.templateActions?.nodes) return

    const newOptions = actionSearchData.templateActions?.nodes.map((templateAction) => ({
      text: `${templateAction?.template?.code} - ${templateAction?.trigger}`,
      key: templateAction?.id || 0,
      value: templateAction?.id || 0,
      valueFull: {
        description: templateAction?.description || '',
        condition: templateAction?.condition,
        parameterQueries: templateAction?.parameterQueries,
      },
    }))

    setActionTemplateState({
      ...actionTemplateState,
      ...newState,
      options: newOptions,
    })
  }, [actionSearchData])

  return (
    <Dropdown
      text="From Existing"
      className="from-existing-dropdown"
      search
      selection
      icon="search"
      onClick={() => {
        setActionTemplateState({
          isSearching: true,
          pluginCode: pluginCode,
          options: [{ text: 'Loading', key: -1 }],
        })
      }}
      options={actionTemplateState.options}
      onChange={(_, { value }) => {
        const selected = actionTemplateState.options.find((option) => option?.value === value)
        if (selected?.valueFull) setTemplateAction(selected.valueFull)
      }}
    />
  )
}

export default FromExistingAction
