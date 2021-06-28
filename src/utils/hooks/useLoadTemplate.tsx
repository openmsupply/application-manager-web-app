import { useEffect, useState } from 'react'
import {
  GetTemplateQuery,
  Template,
  TemplateElementCategory,
  TemplateSection,
  TemplateStatus,
  useGetTemplateQuery,
} from '../generated/graphql'
import evaluate from '@openmsupply/expression-evaluator'
import { useUserState } from '../../contexts/UserState'
import { EvaluatorParameters } from '../types'
import { getTemplateSections } from '../helpers/application/getSectionsDetails'
import { TemplateDetails } from '../types'
import config from '../../config'

const graphQLEndpoint = config.serverGraphQL

interface UseLoadTemplateProps {
  templateCode?: string
  status?: TemplateStatus
}

const useLoadTemplate = ({ templateCode, status = TemplateStatus.Draft }: UseLoadTemplateProps) => {
  const [template, setTemplate] = useState<TemplateDetails>()
  const [error, setError] = useState('')
  const {
    userState: { currentUser },
  } = useUserState()

  const {
    data,
    loading: apolloLoading,
    error: apolloError,
  } = useGetTemplateQuery({
    variables: {
      code: templateCode || '',
      status,
    },
    skip: !templateCode,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (!data || !currentUser) return

    // Check that only one template matched
    let error = checkForTemplateErrors(data)
    if (error) {
      setError(error)
      return
    }

    const template = data?.templates?.nodes[0] as Template

    error = checkForTemplateSectionErrors(template)
    if (error) {
      setError(error)
      return
    }

    const { id, code, name } = template
    const templateSections = template.templateSections.nodes as TemplateSection[]
    const sections = getTemplateSections(templateSections)
    const elementsIds: number[] = []
    const elementsDefaults: any[] = []

    templateSections.forEach((section) => {
      const { templateElementsBySectionId } = section as TemplateSection
      templateElementsBySectionId.nodes.forEach((element) => {
        if (
          element?.id &&
          (element.category === TemplateElementCategory.Question || element?.defaultValue !== null)
        ) {
          elementsIds.push(element.id)
          elementsDefaults.push(element.defaultValue)
        }
      })
    })

    const evaluatorParams: EvaluatorParameters = {
      objects: { currentUser },
      APIfetch: fetch,
      graphQLConnection: { fetch: fetch.bind(window), endpoint: graphQLEndpoint },
    }
    evaluate(template?.startMessage || '', evaluatorParams).then((startMessage: any) => {
      setTemplate({
        id,
        code,
        name: name as string,
        elementsIds,
        elementsDefaults,
        sections,
        startMessage,
      })
    })
  }, [data, currentUser])

  return {
    loading: apolloLoading,
    error: apolloError?.message || error,
    template,
  }
}

function checkForTemplateErrors(data: GetTemplateQuery | undefined) {
  const numberOfTemplates = data?.templates?.nodes.length as number
  if (!numberOfTemplates || numberOfTemplates === 0) return 'Template not found'
  if (numberOfTemplates > 1) return 'More then one template found'
  return null
}

function checkForTemplateSectionErrors(template: Template) {
  const numberOfSections = template?.templateSections?.nodes.length as number
  if (!numberOfSections || numberOfSections === 0) return 'No template sections'
  return null
}

export default useLoadTemplate
