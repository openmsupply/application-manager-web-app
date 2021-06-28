import React, { useState } from 'react'
import {
  Button,
  Dropdown,
  Form,
  Header,
  Icon,
  Input,
  Label,
  Modal,
  Popup,
  TextArea,
} from 'semantic-ui-react'
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic'
import {
  TemplateStatus,
  useGetTemplateCategoriesQuery,
  useGetTeplatesAvailableForCodeQuery,
  useUpdateTemplateMutation,
  useGetAllFiltersQuery,
  PermissionPolicyType,
  TemplateFilterJoin,
  useUpdateTemplateFilterJoinMutation,
} from '../../../utils/generated/graphql'
import { TemplateInfo } from './TemplateWrapper'

type Error = { message: string; error: string }

const OnBlurInput: React.FC<{
  label: string
  initialValue: string
  disabled?: boolean
  isIcon?: boolean
  isColor?: boolean
  isTextArea?: boolean
  update: (value: string, resetValue: (value: string) => void) => void
}> = ({ label, initialValue, update, disabled = false, isIcon, isColor, isTextArea = false }) => {
  const [value, setValue] = useState(initialValue)
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
      {!isIcon && !isColor && <Label content={label} />}
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
            rows={5}
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

type CategoryUpdate = {
  code: string
  id?: number
  icon: string
  title: string
}

const Category: React.FC<{
  categoryId?: number
  templateId: number
  setError: (error: Error) => void
}> = ({ categoryId, templateId, setError }) => {
  const [updateTemplate] = useUpdateTemplateMutation()
  const [updateState, setUpdateState] = useState<CategoryUpdate | null>(null)
  const { data: templateCategoriesData, refetch: refetchCategories } =
    useGetTemplateCategoriesQuery()

  const categories = templateCategoriesData?.templateCategories?.nodes || []
  const selectedCategoryId = categoryId
    ? categories.find((category) => category?.id === categoryId)?.id
    : -1

  const categoryOptions = categories.map((category) => ({
    key: category?.title,
    text: category?.title,
    value: category?.id,
    icon: category?.icon,
  }))

  categoryOptions.push({ key: 'no category', value: -1, text: 'no category', icon: '' })

  const renderAddEdit = () => {
    if (updateState) return null
    const canRenderEdit = selectedCategoryId !== -1
    return (
      <>
        <Icon
          name="add"
          onClick={() =>
            setUpdateState({
              code: 'new code',
              icon: 'globe',
              title: 'new title',
            })
          }
        />
        {canRenderEdit && (
          <Icon
            name="edit"
            onClick={() => {
              const selectedCateogry = categories.find(
                (category) => category?.id === selectedCategoryId
              )
              setUpdateState({
                code: selectedCateogry?.code || '',
                icon: selectedCateogry?.icon || '',
                id: selectedCateogry?.id,
                title: selectedCateogry?.title || '',
              })
            }}
          />
        )}
      </>
    )
  }

  const addCategory = async () => {
    try {
      const result = await updateTemplate({
        variables: {
          id: templateId,
          templatePatch: {
            templateCategoryToTemplateCategoryId: {
              create: updateState,
            },
          },
        },
      })
      if (result.errors)
        return setError({
          message: 'error',
          error: JSON.stringify(result.errors),
        })
      setUpdateState(null)
      refetchCategories()
    } catch (e) {
      setError({ message: 'error', error: e })
    }
  }

  const editCategory = () => {
    if (updateState === null) return
    updateTemplate({
      variables: {
        id: templateId,
        templatePatch: {
          templateCategoryToTemplateCategoryId: {
            updateById: {
              patch: updateState,
              id: updateState.id || 0,
            },
          },
        },
      },
    })
    setUpdateState(null)
  }

  return (
    <>
      <div className="categories-input">
        <Label content="Categories" />
        <Dropdown
          value={selectedCategoryId}
          options={categoryOptions}
          disabled={!!updateState}
          selection
          onChange={(_, { value }) => {
            updateTemplate({
              variables: {
                id: templateId,
                templatePatch: { templateCategoryId: value === -1 ? null : Number(value) },
              },
            })
          }}
        />

        {renderAddEdit()}
      </div>
      {updateState && (
        <div className="category-add-edit" key="categoryEdit">
          <Header as="h5">{`${updateState.id ? 'Edit' : 'Add'} Category`}</Header>
          <OnBlurInput
            key="categoryCode"
            initialValue={updateState.code}
            label="Code"
            update={(value: string) => setUpdateState({ ...updateState, code: value })}
          />
          <OnBlurInput
            key="categoryCode"
            initialValue={updateState.title}
            label="Title"
            update={(value: string) => setUpdateState({ ...updateState, title: value })}
          />

          <OnBlurInput
            key="categoryIcon"
            initialValue={updateState.icon}
            label="Icon"
            isIcon={true}
            update={(value: string) => setUpdateState({ ...updateState, icon: value })}
          />
          <div className="add-edit-category-buttons">
            <Button inverted primary onClick={updateState.id ? editCategory : addCategory}>
              {updateState.id ? 'Save' : 'Add'}
            </Button>
            <Button inverted primary onClick={() => setUpdateState(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

const General: React.FC<{ templateInfo: TemplateInfo }> = ({ templateInfo }) => {
  const [updateTemplate] = useUpdateTemplateMutation()
  const [error, setError] = useState<Error | null>(null)
  const { data: availableTemplatesData, refetch: refetchAvailable } =
    useGetTeplatesAvailableForCodeQuery({
      variables: { code: templateInfo?.code || '' },
    })

  const canSetAvailable =
    availableTemplatesData?.templates?.nodes?.length === 0 &&
    templateInfo?.status !== TemplateStatus.Available

  const canSetDraft =
    templateInfo?.status !== TemplateStatus.Draft && templateInfo?.applications.totalCount === 0

  const canSetDisabled = templateInfo?.status !== TemplateStatus.Disabled

  return (
    <div className="template-inner-config">
      <div key="actionButtons" className="flex-row">
        <Popup
          content="At least one template with the same code is already available, or this template already available"
          key="not draft"
          disabled={canSetAvailable}
          trigger={
            <div>
              <Button
                key="makeAvailable"
                inverted
                primary
                disabled={!canSetAvailable}
                onClick={() => {
                  updateTemplate({
                    variables: {
                      id: templateInfo?.id || 0,
                      templatePatch: { status: TemplateStatus.Available },
                    },
                  })
                }}
              >
                Make Available
              </Button>
            </div>
          }
        />

        <Popup
          content="Already has appications or is draft"
          key="already draft"
          disabled={canSetDraft}
          trigger={
            <div>
              <Button
                key="makeDraft"
                inverted
                primary
                disabled={!canSetDraft}
                onClick={async () => {
                  try {
                    const result = await updateTemplate({
                      variables: {
                        id: templateInfo?.id || 0,
                        templatePatch: { status: TemplateStatus.Draft },
                      },
                    })

                    if (result.errors)
                      return setError({
                        message: 'error',
                        error: JSON.stringify(result.errors),
                      })
                    refetchAvailable()
                  } catch (e) {
                    setError({ message: 'error', error: e })
                  }
                }}
              >
                Make Draft
              </Button>
            </div>
          }
        />

        <Popup
          content="Already disabled"
          key="disabled_popup"
          disabled={canSetDisabled}
          trigger={
            <div>
              <Button
                key="disable"
                inverted
                primary
                disabled={!canSetDisabled}
                onClick={async () => {
                  try {
                    const result = await updateTemplate({
                      variables: {
                        id: templateInfo?.id || 0,
                        templatePatch: { status: TemplateStatus.Disabled },
                      },
                    })

                    if (result.errors)
                      return setError({
                        message: 'error',
                        error: JSON.stringify(result.errors),
                      })
                    refetchAvailable()
                  } catch (e) {
                    setError({ message: 'error', error: e })
                  }
                }}
              >
                Disable
              </Button>
            </div>
          }
        />
      </div>
      <OnBlurInput
        key="changeName"
        initialValue={templateInfo?.name || ''}
        label="Name"
        update={(value: string) => {
          updateTemplate({
            variables: {
              id: templateInfo?.id || 0,
              templatePatch: { name: value },
            },
          })
        }}
      />

      <Popup
        content="Can only change code of draft template"
        key="already draft"
        disabled={templateInfo?.status === TemplateStatus.Draft}
        trigger={
          <div>
            <OnBlurInput
              key="changeCode"
              disabled={templateInfo?.status !== TemplateStatus.Draft}
              initialValue={templateInfo?.code || ''}
              label="Code"
              update={(value: string) => {
                updateTemplate({
                  variables: {
                    id: templateInfo?.id || 0,
                    templatePatch: { code: value },
                  },
                })
              }}
            />
          </div>
        }
      />

      <Category
        setError={setError}
        key="editCategory"
        categoryId={templateInfo?.templateCategory?.id}
        templateId={templateInfo?.id || 0}
      />

      <Filters
        setError={setError}
        key="editFilters"
        filterJoins={(templateInfo?.templateFilterJoins?.nodes || []) as TemplateFilterJoin[]}
        templateId={templateInfo?.id || 0}
      />
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

type UpdateFilter = {
  code: string
  title: string
  icon: string
  id?: number
  iconColor: string
  userRole: PermissionPolicyType
  query: object
}

const Filters: React.FC<{
  templateId: number
  filterJoins: TemplateFilterJoin[]
  setError: (error: Error) => void
}> = ({ templateId, filterJoins, setError }) => {
  const [selectedFilterJoinId, setSelectedFilterJoinId] = useState(-1)
  const [updateState, setUpdateState] = useState<UpdateFilter | null>(null)

  const { data: allFiltersData, refetch: refetchFilters } = useGetAllFiltersQuery()
  const [updateTemplate] = useUpdateTemplateMutation()
  const [updateTemplateFilterJoin] = useUpdateTemplateFilterJoinMutation()

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
          onClick={() => {
            updateTemplate({
              variables: {
                id: templateId || 0,
                templatePatch: {
                  templateFilterJoinsUsingId: { deleteById: [{ id: selectedFilterJoinId || 0 }] },
                },
              },
            })
            setUpdateState(null)
            setSelectedFilterJoinId(-1)
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

    try {
      const result = await updateTemplateFilterJoin({
        variables: {
          id: selectedFilterJoinId || 0,
          filterJoinPatch: {
            filterToFilterId: {
              updateById: {
                patch: updateState,
                id: updateState?.id || 0,
              },
            },
          },
        },
      })
      if (result.errors)
        return setError({
          message: 'error',
          error: JSON.stringify(result.errors),
        })
      refetchFilters()
      setUpdateState(null)
      setSelectedFilterJoinId(-1)
    } catch (e) {
      setError({ message: 'error', error: e })
    }
  }

  const addFilter = async () => {
    if (!updateState) return

    try {
      if (selectedFilterJoinId === -1) {
        const result = await updateTemplate({
          variables: {
            id: templateId,
            templatePatch: {
              templateFilterJoinsUsingId: {
                create: [{ filterToFilterId: { create: updateState } }],
              },
            },
          },
        })
        if (result.errors)
          return setError({
            message: 'error',
            error: JSON.stringify(result.errors),
          })
      } else {
        const result = await updateTemplateFilterJoin({
          variables: {
            id: selectedFilterJoinId,
            filterJoinPatch: {
              filterToFilterId: {
                create: updateState,
              },
            },
          },
        })
        if (result.errors)
          return setError({
            message: 'error',
            error: JSON.stringify(result.errors),
          })
      }
      refetchFilters()
      setUpdateState(null)
      setSelectedFilterJoinId(-1)
    } catch (e) {
      setError({ message: 'error', error: e })
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
          <OnBlurInput
            key="filterCode"
            initialValue={updateState.code}
            label="Code"
            update={(value: string) => setUpdateState({ ...updateState, code: value })}
          />
          <OnBlurInput
            key="filterTitle"
            initialValue={updateState.title}
            label="Title"
            update={(value: string) => setUpdateState({ ...updateState, title: value })}
          />
          <OnBlurInput
            key="categoryIcon"
            initialValue={updateState.icon}
            label="Icon"
            isIcon={true}
            update={(value: string) => setUpdateState({ ...updateState, icon: value })}
          />
          <OnBlurInput
            key="filterColor"
            initialValue={updateState.iconColor}
            label="Icon Color"
            isColor={true}
            update={(value: string) => setUpdateState({ ...updateState, iconColor: value })}
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

const JsonTextBox: React.FC<{
  initialValue: object
  label: string
  update: (value: object) => void
}> = ({ initialValue, update, label }) => {
  const [isError, setIsError] = useState(false)

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

  const getInitialValue = () => {
    try {
      return JSON.stringify(initialValue, null, ' ')
    } catch (e) {
      return '{}'
    }
  }

  return (
    <>
      <OnBlurInput
        key="categoryCode"
        initialValue={getInitialValue()}
        label={label}
        isTextArea={true}
        update={(value, resetValue) => resetValue(tryToSetValue(value))}
      />
      {isError && (
        <Label basic color="red" pointing="above">
          Not a valid JSON
        </Label>
      )}
    </>
  )
}

export default General
