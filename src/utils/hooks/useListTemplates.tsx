import { useEffect, useState } from 'react'
import { SemanticICONS } from 'semantic-ui-react'
import {
  Filter,
  PermissionPolicyType,
  Template,
  useGetTemplatesQuery,
} from '../../utils/generated/graphql'
import constants from '../constants'
import { TemplateDetails, TemplatePermissions } from '../types'

type TemplatesByCategory = { [key: string]: TemplateDetails[] }

type TemplatesData = {
  templates: TemplateDetails[]
  templatesByCategory: TemplatesByCategory
}

const useListTemplates = (templatePermissions: TemplatePermissions, isLoading: boolean) => {
  const [templatesData, setTemplatesData] = useState<TemplatesData>({
    templates: [],
    templatesByCategory: {},
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const { data, error: apolloError } = useGetTemplatesQuery({
    skip: isLoading,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (apolloError) {
      setError(apolloError.message)
      setLoading(false)
    }

    if (data?.templates?.nodes) {
      const filteredTemplates = (data?.templates?.nodes || []).filter(
        (template) => templatePermissions[String(template?.code)]
      ) as Template[]
      if (filteredTemplates.length === 0) return

      const templates = filteredTemplates.map((template) =>
        convertFromTemplateToTemplateDetails(template, templatePermissions)
      )

      setTemplatesData({
        templates,
        templatesByCategory: getTemplatesByCategory(templates),
      })

      setLoading(false)
    }
  }, [data, apolloError])

  return {
    error,
    loading,
    templatesData,
  }
}

const getTemplatesByCategory = (templates: TemplateDetails[]) => {
  const templatesByCategory: TemplatesByCategory = {}

  templates.forEach((template) => {
    const title = String(template.categoryTitle)
    if (!templatesByCategory[title]) templatesByCategory[title] = []
    templatesByCategory[title].push(template)
  })

  return templatesByCategory
}

const convertFromTemplateToTemplateDetails = (
  template: Template,
  templatePermissions: TemplatePermissions
) => {
  const { id, code, name } = template
  const permissions = templatePermissions[code]
  const categoryTitle =
    template?.templateCategory?.title || constants.DEFAULT_TEMPLATE_CATEGORY_TITLE
  const categoryIcon = (categoryTitle === constants.DEFAULT_TEMPLATE_CATEGORY_TITLE
    ? constants.DEFAULT_TEMPLATE_CATEGORY_ICON
    : template?.templateCategory?.icon || undefined) as SemanticICONS

  const result: TemplateDetails = {
    id,
    code,
    name: String(name),
    permissions,
    filters: extractFilters(template, permissions),
    categoryTitle,
    categoryIcon,
  }

  return result
}

const extractFilters = (template: Template, permissions: PermissionPolicyType[]) => {
  const templateFilters = template?.templateFilterJoins?.nodes?.map(
    (templateFilterJoin) => templateFilterJoin?.templateFilter
  )

  const userRoleFilters = templateFilters?.filter(
    (templateFilter) =>
      templateFilter &&
      permissions.find(
        (permission) => permission.toLowerCase() === templateFilter?.userRole?.toLowerCase()
      )
  )

  return (userRoleFilters || []) as Filter[]
}

export default useListTemplates
