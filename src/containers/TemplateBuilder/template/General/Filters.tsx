import React, { useState } from 'react'
import { Header, Icon, Label } from 'semantic-ui-react'
import { Loading } from '../../../../components'
import {
  PermissionPolicyType,
  TemplateFilterJoin,
  useGetAllFiltersQuery,
} from '../../../../utils/generated/graphql'
import ButtonWithFallback from '../../shared/ButtonWidthFallback'
import DropdownIO from '../../shared/DropdownIO'
import JsonIO from '../../shared/JsonIO'
import { useOperationState } from '../../shared/OperationContext'
import { getRandomNumber } from '../../shared/OperationContextHelpers'
import TextIO, { iconLink } from '../../shared/TextIO'
import { useTemplateState } from '../TemplateWrapper'

type UpdateFilter = {
  code: string
  title: string
  icon: string
  id?: number
  iconColor: string
  userRole: PermissionPolicyType
  query: object
}

const userRoleOptions = [
  { type: 'APPLY', text: 'Applicant' },
  { type: 'ASSIGN', text: 'Assigner' },
  { type: 'REVIEW', text: 'Reviewer' },
]

const newFilter = {
  id: -1,
  code: 'new code',
  title: 'new filter',
  icon: 'globe',
  iconColor: 'blue',
  userRole: PermissionPolicyType.Apply,
  query: { status: 'SUBMITTED' },
}

const Filters: React.FC = () => {
  const [selectedFilterJoin, setSelectedFilterJoin] = useState<TemplateFilterJoin | null>(null)
  const [selectedFilter, setSelectedFilter] = useState(newFilter)

  const [updateState, setUpdateState] = useState<UpdateFilter | null>(null)
  const { data: allFiltersData, refetch: refetchFilters } = useGetAllFiltersQuery()
  const { template, templateFilterJoins: filterJoins } = useTemplateState()
  const { updateTemplate, updateTemplateFilterJoin } = useOperationState()

  if (!allFiltersData?.filters?.nodes) return <Loading />

  const allFilters = [...(allFiltersData?.filters?.nodes || []), newFilter]

  const selectFilterJoin = (filterJoin: TemplateFilterJoin | null) => {
    setSelectedFilterJoin(filterJoin)
    if (filterJoin) {
      const filter = filterJoin?.filter
      setUpdateState({
        code: filter?.code || '',
        title: filter?.title || '',
        id: filter?.id || 0,
        icon: filter?.icon || '',
        iconColor: filter?.iconColor || '',
        userRole: filter?.userRole || PermissionPolicyType.Apply,
        query: filter?.query,
      })
    } else setUpdateState(null)
  }

  const deleteFilterJoin = async () => {
    if (
      await updateTemplate(template.id, {
        templateFilterJoinsUsingId: { deleteById: [{ id: selectedFilterJoin?.id || 0 }] },
      })
    ) {
      selectFilterJoin(null)
    }
  }

  const editFilter = async () => {
    if (!updateState) return

    if (
      await updateTemplateFilterJoin(selectedFilterJoin?.id || 0, {
        filterToFilterId: {
          updateById: {
            patch: updateState,
            id: updateState?.id || 0,
          },
        },
      })
    ) {
      refetchFilters()
      selectFilterJoin(null)
    }
  }

  const addFilterJoin = async () => {
    if (selectedFilter?.id !== -1) {
      updateTemplate(template.id, {
        templateFilterJoinsUsingId: {
          create: [{ filterId: selectedFilter?.id || 0 }],
        },
      })
    } else {
      const { id, code, ...newPartial } = newFilter
      updateTemplate(template.id, {
        templateFilterJoinsUsingId: {
          create: [
            {
              filterToFilterId: { create: { ...newPartial, code: `newCode_${getRandomNumber()}` } },
            },
          ],
        },
      })
    }
  }

  return (
    <>
      <Header as="h3">Dashboard Filters</Header>
      <div className="flex-row-start-center">
        <DropdownIO
          value={selectedFilter.id}
          title="Categories"
          options={allFilters}
          getKey={'id'}
          getValue={'id'}
          getText={'title'}
          setValue={(_, fullValue) => {
            setSelectedFilter(fullValue)
          }}
        />
        <Icon className="clickable" name="add square" onClick={addFilterJoin} />
      </div>
      <div className="filter-joins">
        {filterJoins.map((filterJoin) => (
          <Label
            key={filterJoin.id}
            onClick={() => {
              selectFilterJoin(filterJoin)
            }}
            className={`${filterJoin?.id === selectedFilterJoin?.id ? 'selected' : ''}`}
          >
            {filterJoin?.filter?.code}
          </Label>
        ))}
      </div>

      {updateState && (
        <div key={selectedFilterJoin?.id} className="template-bulder-filter-input ">
          <Header as="h5">{`Edit Filter`}</Header>
          <TextIO
            text={updateState.code}
            title="Code"
            setText={(value: string) => setUpdateState({ ...updateState, code: value })}
          />
          <TextIO
            text={updateState.title}
            title="Code"
            setText={(value: string) => setUpdateState({ ...updateState, title: value })}
          />
          <TextIO
            text={updateState.icon}
            title="Icon"
            color={updateState.iconColor}
            icon={updateState.icon}
            link={iconLink}
            setText={(value: string) => setUpdateState({ ...updateState, icon: value })}
          />
          <TextIO
            text={updateState.iconColor}
            title="Icon Color"
            color={updateState.iconColor}
            setText={(value: string) => setUpdateState({ ...updateState, iconColor: value })}
          />

          <DropdownIO
            value={updateState.userRole}
            options={userRoleOptions}
            getKey="type"
            getValue="type"
            getText="text"
            title="User Role"
            setValue={(value) => {
              setUpdateState({ ...updateState, userRole: value as PermissionPolicyType })
            }}
          />
          <div className="longer">
            <JsonIO
              key="filterQuery"
              object={updateState.query}
              label="query"
              setObject={(value) => setUpdateState({ ...updateState, query: value })}
            />
          </div>
          <div className="spacer-20" />
          <div className="flex-row">
            <ButtonWithFallback title="Save" onClick={editFilter} />
            <ButtonWithFallback title="Unlink" onClick={() => deleteFilterJoin()} />
            <ButtonWithFallback title="Cancel" onClick={() => selectFilterJoin(null)} />
          </div>
        </div>
      )}
    </>
  )
}

export default Filters
