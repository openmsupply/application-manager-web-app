import React, { useState, useEffect, useContext, createContext } from 'react'
import { Loading } from '../../../../components'
import { TemplateSection } from '../../../../utils/generated/graphql'
import { useOperationState } from '../../shared/OperationContext'
import { useTemplateState } from '../TemplateWrapper'
import getMoveStructure, { MoveStructure } from './moveStructure'

const pageBreakCode = 'pageBreak'

type FormStructureContextState = {
  configApplicationSerial: string
  configApplicationId: number
  moveStructure: MoveStructure
}

const defaultFomrStructureContextState: FormStructureContextState = {
  configApplicationSerial: '',
  configApplicationId: 0,
  moveStructure: { sections: {}, elements: {} },
}

const Context = createContext<FormStructureContextState>(defaultFomrStructureContextState)

const calculatePageBreaksToTrim = (sections: TemplateSection[]) => {
  const pageBreaksToTrim: { [sectionId: number]: number[] } = {}

  const addToPageBreaksToTrim = (sectionId: number, elementIds: number[]) => {
    if (!pageBreaksToTrim[sectionId]) pageBreaksToTrim[sectionId] = []
    pageBreaksToTrim[sectionId] = [...pageBreaksToTrim[sectionId], ...elementIds]
  }

  let currentSectionId = 0

  sections.forEach((section) => {
    currentSectionId = section?.id || 0
    const elements = section?.templateElementsBySectionId?.nodes || []

    let consequitivePageBreaks: number[] = []

    elements.forEach((element, index) => {
      const isPageBreak = element?.elementTypePluginCode === pageBreakCode
      const isStartOfSection = index == 0
      const isEndOfSection = index === elements.length - 1
      if (isPageBreak) {
        if (isStartOfSection || isEndOfSection)
          addToPageBreaksToTrim(currentSectionId, [element?.id || 0])
        consequitivePageBreaks.push(element?.id || 0)
      } else {
        if (consequitivePageBreaks.length > 1)
          addToPageBreaksToTrim(currentSectionId, consequitivePageBreaks)
        consequitivePageBreaks = []
      }
    })
    if (consequitivePageBreaks.length > 1)
      addToPageBreaksToTrim(currentSectionId, consequitivePageBreaks)
  })

  return pageBreaksToTrim
}

const FormWrapper: React.FC = ({ children }) => {
  const [state, setState] = useState<FormStructureContextState | null>(null)
  const { updateTemplateSection } = useOperationState()
  const { fromQuery: templateInfo, template, sections } = useTemplateState()

  const [isReady, setIsReady] = useState(false)

  const trimPageBreaks = async (pageBreaksToTrim: { [sectionId: number]: number[] }) => {
    const sectionAndElementIds = Object.entries(pageBreaksToTrim)

    if (sectionAndElementIds.length === 0) {
      setIsReady(true)
      return
    }

    for (const [sectionId, elementIds] of sectionAndElementIds) {
      await updateTemplateSection(Number(sectionId), {
        templateElementsUsingId: {
          deleteById: elementIds.map((id) => ({ id })),
        },
      })
    }
    setIsReady(true)
  }

  useEffect(() => {
    if (!templateInfo) return

    if (!template.isDraft) {
      setIsReady(true)
      return
    }
    trimPageBreaks(calculatePageBreaksToTrim(sections))
  }, [templateInfo])

  useEffect(() => {
    if (!!templateInfo && isReady) {
      const configApplicationSerial = templateInfo?.configApplications?.nodes?.[0]?.serial || ''
      const configApplicationId = templateInfo?.configApplications?.nodes?.[0]?.id || 0
      setState({
        configApplicationSerial,
        configApplicationId,
        moveStructure: getMoveStructure(templateInfo),
      })
    }
  }, [templateInfo, isReady])

  if (!state) return <Loading />

  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const useFormStructureState = () => useContext(Context)
export default FormWrapper
