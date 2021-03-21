import { useEffect, useState } from 'react'
import { Template, useGetTemplatesQuery } from '../../utils/generated/graphql'
import { TemplatesDetails, TemplatePermissions } from '../types'

const useListTemplates = (templatePermissions: TemplatePermissions, isLoading: boolean) => {
  const [filteredTemplates, setFilteredTemplates] = useState<TemplatesDetails>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const { data, error: apolloError, loading: apolloLoading } = useGetTemplatesQuery({
    skip: isLoading,
  })

  useEffect(() => {
    if (apolloError) {
      setError(apolloError.message)
      setLoading(false)
    }

    if (data && data?.templates?.nodes) {
      const allTemplates = data?.templates?.nodes as Template[]
      const filteredTemplates: TemplatesDetails = []
      allTemplates.forEach(({ code, name, templateCategory, templateFilterJoins }) => {
        const permissionFound = Object.entries(templatePermissions).find(([key]) => key === code)
        if (permissionFound) {
          const [key, permissions] = permissionFound
          filteredTemplates.push({
            name: name as string,
            code,
            permissions: permissions,
            templateCategory: templateCategory,
            templateFilterJoins: templateFilterJoins,
          })
        }
      })
      setFilteredTemplates(filteredTemplates)
      setLoading(false)
    }
  }, [data, apolloError])

  return {
    error,
    loading,
    filteredTemplates,
  }
}

export default useListTemplates
