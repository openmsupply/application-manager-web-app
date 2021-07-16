import { DateTime } from 'luxon'
import { useState, useEffect } from 'react'
import { TemplateStatus, useGetAllTemplatesQuery } from '../../utils/generated/graphql'

export type Template = {
  name: string
  status: TemplateStatus
  id: number
  code: string
  category: string
  version: number
  versionTimestamp: DateTime
  applicationCount: number
}
export type Templates = {
  main: Template
  applicationCount: number
  numberOfTemplates: number
  all: Template[]
}[]

const useGetTemplates = () => {
  const [templates, setTemplates] = useState<Templates>([])

  const { data, error, refetch } = useGetAllTemplatesQuery({ fetchPolicy: 'network-only' })

  useEffect(() => {
    if (data && !error) {
      const templates: Templates = []

      const templateNodes = data?.templates?.nodes || []
      templateNodes.forEach((template) => {
        if (
          !template?.code ||
          !template.name ||
          !template.status ||
          !template?.version ||
          !template?.versionTimestamp
        ) {
          console.log('failed to load template', template)
          return
        }

        const {
          code,
          name,
          status,
          id,
          version,
          versionTimestamp,
          templateCategory,
          applications,
        } = template
        const holder = templates.find(({ main }) => main.code === code)

        const current = {
          name,
          status,
          id,
          code,
          category: templateCategory?.title || '',
          version,
          versionTimestamp: DateTime.fromISO(versionTimestamp),
          applicationCount: applications.totalCount || 0,
        }

        if (!holder)
          return templates.push({
            main: current,
            applicationCount: current.applicationCount,
            numberOfTemplates: 1,
            all: [current],
          })
        const { main, all } = holder

        all.push(current)
        if (
          status === TemplateStatus.Available ||
          (main.status !== TemplateStatus.Available &&
            main.versionTimestamp < current.versionTimestamp)
        )
          holder.main = current

        holder.applicationCount += current.applicationCount
        holder.numberOfTemplates = all.length
      })

      setTemplates(templates)
    }
  }, [data])

  return {
    error,
    templates,
    refetch,
  }
}

export default useGetTemplates
