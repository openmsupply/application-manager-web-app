import React, { useState } from 'react'
import { Button, Dropdown, Header, Icon, Label } from 'semantic-ui-react'
import { PermissionPolicyType, useGetAllFiltersQuery } from '../../../../utils/generated/graphql'
import { TextIO, JsonTextBox, iconLink } from '../../shared/components'
import { useOperationState } from '../../shared/OperationContext'
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

const Filters: React.FC = () => {
  const [selectedFilterJoinId, setSelectedFilterJoinId] = useState(-1)
  const [updateState, setUpdateState] = useState<UpdateFilter | null>(null)
  const { data: allFiltersData, refetch: refetchFilters } = useGetAllFiltersQuery()

  const { template, templateFilterJoins: filterJoins } = useTemplateState()
  const { updateTemplate, updateTemplateFilterJoin } = useOperationState()
  const allFilters = allFiltersData?.filters?.nodes || []
  const selectedFilterJoin = filterJoins.find(
    (filterJoin) => filterJoin?.id === selectedFilterJoinId
  )

  const selectedFilter = selectedFilterJoin?.filter
  const selectedFilterId = selectedFilter?.id

  const setAddFilterState = () => {
    setUpdateState({
      code: 'new code',
      title: 'new title',
      icon: 'globe',
      iconColor: 'blue',
      userRole: PermissionPolicyType.Apply,
      query: { status: 'SUBMITTED' },
    })
  }

  const renderAddEditDelete = () => {
    if (updateState) return null
    return (
      <>
        <Icon name="add" onClick={setAddFilterState} />
        <Icon
          name="edit"
          onClick={() => {
            setUpdateState({
              code: selectedFilter?.code || '',
              title: selectedFilter?.title || '',
              id: selectedFilterId,
              icon: selectedFilter?.icon || '',
              iconColor: selectedFilter?.iconColor || '',
              userRole: selectedFilter?.userRole || PermissionPolicyType.Apply,
              query: selectedFilter?.query,
            })
          }}
        />

        <Icon
          name="close"
          onClick={async () => {
            if (
              await updateTemplate(template.id, {
                templateFilterJoinsUsingId: { deleteById: [{ id: selectedFilterJoinId || 0 }] },
              })
            ) {
              setUpdateState(null)
              setSelectedFilterJoinId(-1)
            }
          }}
        />
      </>
    )
  }

  const filterOptions = allFilters.map((filter) => ({
    value: filter?.id,
    key: filter?.id,
    text: filter?.code,
    icon: filter?.icon,
  }))

  const editFilter = async () => {
    if (!updateState) return

    if (
      await updateTemplateFilterJoin(selectedFilterJoinId, {
        filterToFilterId: {
          updateById: {
            patch: updateState,
            id: updateState?.id || 0,
          },
        },
      })
    ) {
      refetchFilters()
      setUpdateState(null)
      setSelectedFilterJoinId(-1)
    }
  }

  const addFilter = async () => {
    if (!updateState) return

    let result = false
    if (selectedFilterJoinId === -1) {
      result = await updateTemplate(template.id, {
        templateFilterJoinsUsingId: {
          create: [{ filterToFilterId: { create: updateState } }],
        },
      })
    } else {
      result = await updateTemplateFilterJoin(selectedFilterJoinId, {
        filterToFilterId: {
          create: updateState,
        },
      })
    }
    if (result) {
      refetchFilters()
      setUpdateState(null)
      setSelectedFilterJoinId(-1)
    }
  }

  return (
    <div className="flex-column" key="editFilters">
      <div
        className="filters-header"
        onClick={() => {
          setSelectedFilterJoinId(-1)
          setAddFilterState()
        }}
      >
        <Header as="h3">Dashboard Filters</Header> <Icon name="add" />
      </div>
      <div className="filter-joins">
        {filterJoins.map((filterJoin) => (
          <Label
            key={filterJoin.id}
            onClick={() => {
              setSelectedFilterJoinId(filterJoin?.id || -1)
              setUpdateState(null)
            }}
            className={`${filterJoin?.id === selectedFilterJoinId ? 'selected' : ''}`}
          >
            {filterJoin?.filter?.code}
          </Label>
        ))}
      </div>

      {selectedFilterJoinId !== -1 && (
        <div className="filter-selection">
          <Label content="Selected Filter" />
          <Dropdown
            disabled={!!updateState}
            value={selectedFilterId}
            selection
            options={filterOptions}
          />
          {renderAddEditDelete()}
        </div>
      )}
      {updateState && (
        <div className="filter-add-edit">
          <Header as="h5">{`${updateState.id ? 'Edit' : 'Add'} Filter`}</Header>
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

          <Dropdown
            key="filterRole"
            value={updateState.userRole}
            selection
            options={[
              { key: 'APPLY', value: 'APPLY', text: 'Applicant' },
              { key: 'ASSIGN', value: 'ASSIGN', text: 'Assigner' },
              { key: 'REVIEW', value: 'REVIEW', text: 'Reviewer' },
            ]}
            label="User Role"
            onChange={(_, { value }) =>
              setUpdateState({ ...updateState, userRole: value as PermissionPolicyType })
            }
          />
          <JsonTextBox
            key="filterQuery"
            initialValue={updateState.query}
            label="query"
            update={(value: object) => setUpdateState({ ...updateState, query: value })}
          />
          <div className="add-edit-filter-buttons">
            <Button inverted primary onClick={updateState.id ? editFilter : addFilter}>
              {updateState.id ? 'Save' : 'Add'}
            </Button>
            <Button inverted primary onClick={() => setUpdateState(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Filters
