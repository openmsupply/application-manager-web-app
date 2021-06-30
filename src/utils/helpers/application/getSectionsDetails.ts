import { TemplateElement, TemplateSection } from '../../generated/graphql'
import { SectionDetails } from '../../types'

export const getTemplateSections = (templateSections: TemplateSection[]) => {
  // TODO: Sort template sections
  // const sections = templateSections.sort(
  //   ({ index: aIndex }, { index: bIndex }) => (aIndex as number) - (bIndex as number)
  // )
  return getSectionDetailsArray(templateSections)
}

export const getSectionDetails = (templateSections: TemplateSection[]) => {
  const sections = [...templateSections].sort(
    ({ index: aIndex }, { index: bIndex }) => (aIndex as number) - (bIndex as number)
  )
  return getSectionDetailsArray(sections)
}

const getSectionDetailsArray = (sectionsList: TemplateSection[]): SectionDetails[] =>
  sectionsList.map((section) => {
    const { id, code, title, index, templateElementsBySectionId } = section as TemplateSection
    const elements = templateElementsBySectionId.nodes as TemplateElement[]
    const pageBreaks = elements.filter(
      ({ elementTypePluginCode }) => elementTypePluginCode === 'pageBreak'
    )
    const totalPages = pageBreaks.length + 1

    return {
      id,
      code: code as string,
      title: title as string,
      index: index as number,
      totalPages,
    }
  })
