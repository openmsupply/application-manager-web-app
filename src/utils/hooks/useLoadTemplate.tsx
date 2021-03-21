import { useEffect, useState } from 'react'
import {
  GetTemplateQuery,
  Template,
  TemplateSection,
  useGetTemplateQuery,
} from '../generated/graphql'
import { buildTemplateSectionsStructure } from '../helpers/structure/buildSectionsStructure'
import { getTemplateSections } from '../helpers/application/getSectionsDetails'
import { SectionsStructure, TemplateDetails } from '../types'

interface useLoadTemplateProps {
  templateCode: string
}

const useLoadTemplate = (props: useLoadTemplateProps) => {
  const { templateCode } = props
  const [template, setTemplate] = useState<TemplateDetails>()
  const [templateActions, setTemplateActions] = useState<any>()
  const [templateStages, setTemplateStages] = useState<any>()
  const [templatePermissions, setTemplatePermissions] = useState<any>()
  const [templateFilters, setTemplateFilters] = useState<any>()
  const [sectionsStructure, setSectionsStructure] = useState<SectionsStructure>()
  const [wholeTemplate, setWholeTemplate] = useState<any>()

  const [elementsIds, setElementsIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [templateCategory, setTemplateCategory] = useState<any>()

  const { data, loading: apolloLoading, error: apolloError } = useGetTemplateQuery({
    variables: {
      code: templateCode,
    },
  })

  useEffect(() => {
    if (apolloError) return
    if (apolloLoading) return
    // Check that only one tempalte matched
    let error = checkForTemplateErrors(data)
    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    const template = data?.templates?.nodes[0] as Template

    error = checkForTemplatSectionErrors(template)
    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    const { id, code, name, startMessage } = template

    setTemplate({
      id,
      code,
      name: name as string,
      startMessage: startMessage ? startMessage : undefined,
    })
    console.log('Template Yow', template)
    setTemplateCategory(template.templateCategory)
    setTemplatePermissions(template.templatePermissions.nodes)

    const templateSections = template.templateSections.nodes as TemplateSection[]
    const sections = getTemplateSections(templateSections)
    const sectionsStructure = buildTemplateSectionsStructure(sections)
    setSectionsStructure(sectionsStructure)

    setTemplateFilters(
      template.templateFilterJoins?.nodes
        .map((templateFilterJoin: any) => ({
          ...templateFilterJoin.templateFilter,
          templateFilterJoinId: templateFilterJoin.id,
        }))
        .flat()
    )
    setTemplateActions(template.templateActions?.nodes)
    setTemplateStages(template.templateStages?.nodes)
    const elements = [] as number[]
    setWholeTemplate(template)
    templateSections.forEach((section) => {
      const { templateElementsBySectionId } = section as TemplateSection
      templateElementsBySectionId.nodes.forEach((element) => {
        if (element?.id && element.category === 'QUESTION') elements.push(element.id)
      })
    })
    setElementsIds(elements)

    setLoading(false)
  }, [data, apolloError])

  return {
    loading,
    apolloError,
    error,
    template,
    sectionsStructure,
    elementsIds,
    templateActions,
    templateCategory,
    templatePermissions,
    templateStages,
    wholeTemplate,
    templateFilters,
  }
}

function checkForTemplateErrors(data: GetTemplateQuery | undefined) {
  if (data?.templates?.nodes?.length === null) return 'Unexpected template result'
  const numberOfTemplates = data?.templates?.nodes.length as number
  if (numberOfTemplates === 0) return 'Template not found'
  if (numberOfTemplates > 1) return 'More then one template found'
  return null
}

function checkForTemplatSectionErrors(template: Template) {
  if (template?.templateSections?.nodes === null) return 'Unexpected template section result'
  const numberOfSections = template?.templateSections?.nodes.length as number
  if (numberOfSections === 0) return 'No template sections'
  return null
}

export default useLoadTemplate
