import React, { useEffect, useState } from 'react'
import {
  Accordion,
  Button,
  Dropdown,
  Form,
  Icon,
  Input,
  Label,
  Message,
  Modal,
} from 'semantic-ui-react'
import {
  useCreateTemplateCategoryMutation,
  useGetTemplateCategoriesQuery,
  useUpdateTemplateCategoryMutation,
  useSetTemplateCategoryMutation,
  useUpdateTemplateFilterMutation,
  useGetTemplateFiltersQuery,
  useCreateTemplateFilterMutation,
  useJoinFilterToTemplateMutation,
  useUpdateTemplateBasicsMutation,
  useDeleteTemplateFilterJionMutation,
  PermissionJoinsOrderBy,
} from '../../utils/generated/graphql'
import setTemplateCategoryMutation from '../../utils/graphql/mutations/setTemplateCategory.mutation'
import Markdown from '../../utils/helpers/semanticReactMarkdown'

import getTemplateCategories from '../../utils/graphql/queries/getTemplateCategories.query'
import { useUserState } from '../../contexts/UserState'
import { EvaluatorParameters } from '../../utils/types'
import evaluate from '@openmsupply/expression-evaluator'
import { createCipheriv } from 'crypto'
import JsonTextArea from './JsonTextArea'

const CreateUpdateCategoryModal: React.FC = ({ toggleOpen, categoryData = {} }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const [lastToggleOpen, setLastToggleOpen] = useState(false)

  const [CategoryIcon, setCategoryIcon] = useState<any>('globe')
  const [CategoryTitle, setCategoryTitle] = useState<any>('New Category Title')

  const [createTemplateCategoryMutation] = useCreateTemplateCategoryMutation({
    refetchQueries: [{ query: getTemplateCategories }],
  })
  const [updateTemplateCategoryMutation] = useUpdateTemplateCategoryMutation()

  useEffect(() => {
    if (categoryData.id) {
      setCategoryIcon(categoryData.icon)
      setCategoryTitle(categoryData.title)
    } else {
      setCategoryIcon('globe')
      setCategoryTitle('New Category Title')
    }
  }, [categoryData])

  useEffect(() => {
    if (toggleOpen === lastToggleOpen) return

    setIsOpen(true)
    setLastToggleOpen(toggleOpen)
  }, [toggleOpen])

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <Modal.Header>{`${categoryData.id === null ? 'Create' : 'Update'} category`}</Modal.Header>
      <Modal.Content>
        <Input
          style={{ margin: 10 }}
          label="Icon"
          defaultValue={CategoryIcon}
          onChange={(_, { value }) => {
            setCategoryIcon(value)
          }}
        />
        <Icon style={{ margin: 10 }} name={CategoryIcon} />

        <Input
          style={{ margin: 10 }}
          label="Title"
          defaultValue={CategoryTitle}
          onChange={(_, { value }) => {
            setCategoryTitle(value)
          }}
        />
        <Button
          style={{ margin: 10 }}
          icon={categoryData.id === null ? 'add' : 'save'}
          onClick={async () => {
            if (categoryData.id === null) {
              createTemplateCategoryMutation({
                variables: {
                  icon: CategoryIcon,
                  title: CategoryTitle,
                },
              })
            } else {
              updateTemplateCategoryMutation({
                variables: { id: categoryData.id, icon: CategoryIcon, title: CategoryTitle },
              })
            }
            setIsOpen(false)
          }}
        />
      </Modal.Content>
    </Modal>
  )
}

const General: React.FC = ({ all }: any) => {
  const { data: templateCategories, refetch } = useGetTemplateCategoriesQuery({
    fetchPolicy: 'network-only',
  })
  const [categoryOptions, setCategoryOptions] = useState<any>([])

  const [selectedCategory, setSelectedCategory] = useState<any>(all?.templateCategory?.id || 0)
  const [modalCategoryDetails, setModalCategoryDetails] = useState<any>({})
  const [toggleOpen, setToggleOpen] = useState(false)
  const [setTemplateCategory] = useSetTemplateCategoryMutation()
  const [updateTemplateBasicsMutation] = useUpdateTemplateBasicsMutation()
  const [startMessageEvaluated, setStartMessageEvaluated] = useState('')
  const {
    userState: { currentUser },
  } = useUserState()

  useEffect(() => {
    console.log(templateCategories)
    if (templateCategories?.templateCategories?.nodes) {
      const options = templateCategories?.templateCategories?.nodes.map((category: any) => ({
        key: category.id,
        text: category.title,
        value: category.id,
        icon: category.icon,
      }))

      setCategoryOptions(options)
    }
  }, [templateCategories])

  useEffect(() => {
    if (!currentUser) return
    const evaluatorParams: EvaluatorParameters = {
      objects: { currentUser },
      APIfetch: fetch,
    }
    evaluate(all.template.startMessage || '', evaluatorParams).then((result: any) =>
      setStartMessageEvaluated(result)
    )
  }, [all])

  console.log(
    'This one',
    categoryOptions.find(({ id }: any) => id === selectedCategory)
  )

  const updateTemplateItem = (key: any) => (_: any, { value }: any) => (all.template[key] = value)
  const mutateTemplateBasics = () =>
    updateTemplateBasicsMutation({ variables: { id: all.template.id, data: all.template } })

  const filterTypes = {
    Applicant: 'Apply',
    Reviewer: 'Review',
    Assigner: 'Assign',
  }

  return (
    <div>
      <CreateUpdateCategoryModal toggleOpen={toggleOpen} categoryData={modalCategoryDetails} />
      <Form>
        <Form.Field>
          <label>Title</label>
          <Form.Input
            type="text"
            defaultValue={all.template.name}
            onChange={updateTemplateItem('name')}
            onBlur={mutateTemplateBasics}
          />
          <label>Code</label>
          <Form.Input
            type="text"
            defaultValue={all.template.code}
            onChange={updateTemplateItem('code')}
            onBlur={mutateTemplateBasics}
          />
          <label>Start Message</label>
          <JsonTextArea
            defaultValue={all.template.startMessage}
            onChange={updateTemplateItem('startMessage')}
            onBlur={mutateTemplateBasics}
          />
          <Message>
            <Markdown text={startMessageEvaluated} />
          </Message>
        </Form.Field>
        <Form.Field>
          <label>Category</label>

          {categoryOptions.length !== 0 && selectedCategory !== 0 ? (
            <Icon
              name={categoryOptions.find(({ value }: any) => value === selectedCategory).icon}
            />
          ) : null}
          <Dropdown
            labeled
            style={{ margin: 10 }}
            placeholder="Select Category"
            options={categoryOptions}
            defaultValue={selectedCategory}
            onChange={(...allthings: any) => {
              setTemplateCategory({
                variables: { templateId: all.template.id, categoryId: allthings[1].value },
              })
              setSelectedCategory(allthings[1].value)
            }}
          />
          {selectedCategory !== 0 ? (
            <Button
              icon="edit"
              style={{ margin: 10 }}
              onClick={() => {
                setModalCategoryDetails(
                  templateCategories?.templateCategories?.nodes.find(
                    ({ id }: any) => id === selectedCategory
                  ) || {}
                )
                setToggleOpen(!toggleOpen)
              }}
            />
          ) : null}

          <Button
            icon="add"
            onClick={() => {
              setModalCategoryDetails({})
              setToggleOpen(!toggleOpen)
            }}
            style={{ margin: 10 }}
          />
        </Form.Field>
        <Form.Field>
          <label>Filters</label>
          {Object.entries(filterTypes).map(([header, type]: any) => (
            <Filters
              header={header}
              type={type}
              templateFilters={all.templateFilters}
              templateId={all.template.id}
            />
          ))}
        </Form.Field>
      </Form>

      <pre>{JSON.stringify(all.templateFilters, null, ' ')}</pre>
      <pre>{JSON.stringify(categoryOptions, null, ' ')}</pre>
      <pre>{JSON.stringify(all.templateCategory, null, ' ')}</pre>
      <pre>{JSON.stringify(all.template, null, ' ')}</pre>
    </div>
  )
}

const TemplateFilter: React.FC = ({ templateFilter }: any) => {
  const [icon, setIcon] = useState(templateFilter.icon)
  const [filterChanges, setFilterChanges] = useState({})
  const [updateTemplateFilterMutation] = useUpdateTemplateFilterMutation()
  const updateTemplateFilterItem = (key: any) => (_: any, { value }: any) =>
    setFilterChanges({ ...filterChanges, [key]: value })

  const mutationUpdateTemplateFilter = () =>
    updateTemplateFilterMutation({ variables: { id: templateFilter.id, data: filterChanges } })

  const [deleteTemplateFilterJion] = useDeleteTemplateFilterJionMutation()

  return (
    <Form>
      <Form.Field>
        <label>icon</label>
        <Icon name={icon} />
        <Input
          defaultValue={templateFilter.icon}
          onChange={(...params) => {
            setIcon(params[1].value)
            updateTemplateFilterItem('icon')(...params)
          }}
          onBlur={mutationUpdateTemplateFilter}
        />
      </Form.Field>
      <Form.Field>
        <label>Title</label>
        <Input
          defaultValue={templateFilter.title}
          onChange={updateTemplateFilterItem('title')}
          onBlur={mutationUpdateTemplateFilter}
        />
      </Form.Field>
      <Form.Field>
        <label>Query</label>
        <JsonTextArea
          defaultValue={templateFilter.query}
          onChange={updateTemplateFilterItem('query')}
          onBlur={mutationUpdateTemplateFilter}
        />
      </Form.Field>
      <Button
        onClick={() =>
          deleteTemplateFilterJion({ variables: { id: templateFilter.templateFilterJoinId } })
        }
      >
        Unlink
      </Button>
    </Form>
  )
}

const Filters: React.FC = ({ header, type, templateFilters, templateId }: any) => {
  const { data } = useGetTemplateFiltersQuery()
  const [joinFilter] = useJoinFilterToTemplateMutation()
  const [createFilter] = useCreateTemplateFilterMutation()
  const templateFiltersForType =
    templateFilters.filter((templateFilter: any) => templateFilter.userRole === type) || []

  console.log(
    data?.filters?.nodes?.filter((templateFilter: any) => templateFilter.userRole === type) || [],
    data,
    type
  )

  return (
    <Message>
      <Dropdown
        button
        className="icon"
        floating
        labeled
        icon="add"
        style={{ margin: 20 }}
        text={header}
        onChange={async (_, { value }) => {
          if (value === 'new') {
            const output = await createFilter({ variables: { userRole: type } })
            console.log(data, output?.data?.createFilter?.filter.id)
            joinFilter({
              variables: { templateId, filterId: output?.data?.createFilter?.filter.id || 1 },
            })
          } else joinFilter({ variables: { templateId, filterId: Number(value) } })
        }}
        options={[
          {
            key: 'new',
            text: 'new',
            value: 'new',
          },
          ...(
            data?.filters?.nodes?.filter(
              (templateFilter: any) => templateFilter.userRole === type
            ) || []
          ).map((templateFilter: any) => ({
            key: templateFilter.id,
            text: `${templateFilter.title} - ${templateFilter.code}`,
            value: templateFilter.id,
          })),
        ]}
      />
      {templateFiltersForType.length === 0 ? null : (
        <Accordion
          styled
          defaultActiveIndex={-1}
          panels={templateFiltersForType.map((templateFilter: any) => ({
            key: templateFilter.templateFilterJoinId,
            title: {
              content: (
                <Label>
                  <Icon name={templateFilter.icon} />
                  {`${templateFilter.code} - ${templateFilter.title} {Description}`}
                </Label>
              ),
            },
            content: {
              content: <TemplateFilter templateFilter={templateFilter} />,
            },
          }))}
        />
      )}
    </Message>
  )
}

export default General
