import React, { useState } from 'react'
import { Icon, Header } from 'semantic-ui-react'
import { Loading } from '../../../../components'
import { useGetTemplateCategoriesQuery } from '../../../../utils/generated/graphql'
import { TextIO, ButtonWithFallback, iconLink, DropdownIO } from '../../shared/components'
import { useOperationState } from '../../shared/OperationContext'
import { useTemplateState } from '../TemplateWrapper'

const noCategory = {
  title: 'no category',
  id: -1,
  code: '',
  icon: '',
}

const newCategory = {
  code: 'new code',
  icon: 'globe',
  title: 'new title',
}

type CategoryUpdate = {
  code: string
  id?: number
  icon: string
  title: string
}

const Category: React.FC<{}> = () => {
  const { category, template } = useTemplateState()
  const { updateTemplate } = useOperationState()
  const [updateState, setUpdateState] = useState<CategoryUpdate | null>(null)
  const { data: templateCategoriesData, refetch: refetchCategories } =
    useGetTemplateCategoriesQuery()

  if (!templateCategoriesData?.templateCategories?.nodes) return <Loading />

  const categories = templateCategoriesData?.templateCategories?.nodes || []
  const selectedCategory =
    categories.find((_category) => _category?.id === category?.id) || noCategory

  const categoryOptions = [...categories, noCategory]

  const renderAddEdit = () => {
    if (updateState) return null
    const canRenderEdit = selectedCategory.id !== noCategory.id
    return (
      <>
        <Icon className="clickable" name="add" onClick={() => setUpdateState(newCategory)} />
        {canRenderEdit && (
          <Icon
            className="clickable"
            name="edit"
            onClick={() => {
              setUpdateState({
                code: selectedCategory?.code || '',
                icon: selectedCategory?.icon || '',
                id: selectedCategory?.id,
                title: selectedCategory?.title || '',
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
      <div className="flex-row-start-center">
        <DropdownIO
          value={selectedCategory.id}
          title="Categories"
          options={categoryOptions}
          disabled={!!updateState}
          getKey={'id'}
          getValue={'id'}
          getText={'title'}
          setValue={(value) => {
            updateTemplate(template.id, { templateCategoryId: value === -1 ? null : Number(value) })
          }}
        />

        {renderAddEdit()}
      </div>
      {updateState && (
        <div className="template-buider-category-input">
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
          <div className="spacer-20" />

          <div className="flex-row">
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
