import { useEffect, useState } from 'react'
import {
  GetTemplateQuery,
  Template,
  TemplateSection,
  useGetTemplateQuery,
} from '../generated/graphql'
import { getTemplateSections } from '../helpers/getSectionsPayload'
import { TemplateTypePayload, TemplateSectionPayload } from '../types'

interface useLoadTemplateProps {
  templateCode: string
}

const useLoadTemplate = (props: useLoadTemplateProps) => {
  const { templateCode } = props
  const [templateType, setTemplateType] = useState<TemplateTypePayload | null>(null)
  const [templateSections, setTemplateSections] = useState<TemplateSectionPayload[] | null>(null)
  const [templateElementsIds, setElementsIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

    const { id, code, name, templateSections } = template

    setTemplateType({
      id,
      code,
      name: name ? name : 'Undefined name',
      description: 'Include some description for this template',
      documents: Array<string>(),
    })

    const sections = getTemplateSections(templateSections)
    setTemplateSections(sections)

    const elements = [] as number[]

    templateSections.nodes.forEach((section) => {
      const { templateElementsBySectionId } = section as TemplateSection
      templateElementsBySectionId.nodes.forEach((element) => {
        if (element?.id) elements.push(element.id)
      })
    })
    setElementsIds(elements)

    setLoading(false)
  }, [data, apolloError])

  return {
    loading,
    apolloError,
    error,
    templateType,
    templateSections,
    templateElementsIds,
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
