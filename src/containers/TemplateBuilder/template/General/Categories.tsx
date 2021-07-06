import React, { useState } from 'react'
import { Icon, Label, Dropdown, Header } from 'semantic-ui-react'
import { useGetTemplateCategoriesQuery } from '../../../../utils/generated/graphql'
import { TextIO, ButtonWithFallback, iconLink } from '../../shared/components'
import { useOperationState } from '../../shared/OperationContext'
import { useTemplateContext } from '../TemplateWrapper'

type CategoryUpdate = {
  code: string
  id?: number
  icon: string
  title: string
}

const Category: React.FC<{}> = () => {
  const { category, template } = useTemplateContext()
  const { updateTemplate } = useOperationState()
  const [updateState, setUpdateState] = useState<CategoryUpdate | null>(null)
  const { data: templateCategoriesData, refetch: refetchCategories } =
    useGetTemplateCategoriesQuery()

  const categories = templateCategoriesData?.templateCategories?.nodes || []
  const selectedCategoryId = category?.id
    ? categories.find((category) => category?.id === category?.id)?.id
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
    if (
      await updateTemplate(template.id, {
        templateCategoryToTemplateCategoryId: {
          create: updateState,
        },
      })
    )
      refetchCategories()
  }

  const editCategory = async () => {
    if (updateState === null) return
    if (
      await updateTemplate(template.id, {
        templateCategoryToTemplateCategoryId: {
          updateById: {
            patch: updateState,
            id: updateState.id || 0,
          },
        },
      })
    )
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
            updateTemplate(template.id, { templateCategoryId: value === -1 ? null : Number(value) })
          }}
        />

        {renderAddEdit()}
      </div>
      {updateState && (
        <div className="category-add-edit" key="categoryEdit">
          <Header as="h5">{`${updateState.id ? 'Edit' : 'Add'} Category`}</Header>
          <TextIO
            text={updateState.code}
            title="Code"
            setText={(text) => setUpdateState({ ...updateState, code: text })}
          />
          <TextIO
            text={updateState.title}
            title="Title"
            setText={(value: string) => setUpdateState({ ...updateState, title: value })}
          />
          <TextIO
            text={updateState.icon}
            title="Icon"
            link={iconLink}
            icon={updateState.icon}
            setText={(value: string) => setUpdateState({ ...updateState, icon: value })}
          />

          <div className="add-edit-category-buttons">
            <ButtonWithFallback
              title={updateState.id ? 'Save' : 'Add'}
              onClick={updateState.id ? editCategory : addCategory}
            />
            <ButtonWithFallback title="Cancel" onClick={() => setUpdateState(null)} />
          </div>
        </div>
      )}
    </>
  )
}

export default Category
