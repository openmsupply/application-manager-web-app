import { TemplateElementCategory } from '../../generated/graphql'
import { ElementState, FullStructure, Page, ApplicationProgress, SectionState } from '../../types'

const initialProgress = {
  doneNonRequired: 0,
  doneRequired: 0,
  completed: false,
  totalNonRequired: 0,
  totalRequired: 0,
  totalSum: 0,
  valid: true,
  firstStrictInvalidPage: Infinity,
}

const calculateCompleted = (totalSum: number, doneRequired: number, doneNonRequired: number) => {
  const totalDone = doneRequired + doneNonRequired
  return totalSum === totalDone
}

const getSectionProgress = (pages: Page[]): ApplicationProgress => {
  const sectionProgress = pages.reduce(
    (sectionProgress: ApplicationProgress, { number, progress }) => {
      if (!progress) return sectionProgress
      sectionProgress.doneNonRequired += progress.doneNonRequired || 0
      sectionProgress.totalNonRequired += progress.totalNonRequired || 0
      sectionProgress.doneRequired += progress.doneRequired || 0
      sectionProgress.totalRequired += progress.totalRequired || 0
      sectionProgress.totalSum = sectionProgress.totalRequired + sectionProgress.doneNonRequired
      sectionProgress.completed = calculateCompleted(
        sectionProgress.totalSum,
        sectionProgress.doneRequired,
        sectionProgress.doneNonRequired
      )
      if (!progress.valid) sectionProgress.valid = false
      if (
        sectionProgress.firstStrictInvalidPage &&
        number < sectionProgress.firstStrictInvalidPage &&
        (!progress.valid || progress.doneRequired < progress.totalRequired)
      )
        sectionProgress.firstStrictInvalidPage = number
      return sectionProgress
    },
    { ...initialProgress }
  )
  if (sectionProgress.firstStrictInvalidPage === Infinity)
    sectionProgress.firstStrictInvalidPage = null
  return sectionProgress
}

const generateApplicantResponsesProgress = (structure: FullStructure) => {
  let firstIncompleteSectionCode = ''
  let firstIncompleteSectionIndex = Infinity
  let firstStrictInvalidPageInSection = Infinity
  const updateFirstInvalid = (section: SectionState, page: Page) => {
    if (
      section.details.index <= firstIncompleteSectionIndex &&
      page.number < firstStrictInvalidPageInSection &&
      (!page.progress.valid || page.progress.doneRequired < page.progress.totalRequired)
    ) {
      firstStrictInvalidPageInSection = page.number
      firstIncompleteSectionIndex = section.details.index
      firstIncompleteSectionCode = section.details.code
    }
  }
  Object.values(structure.sections).forEach((section) => {
    Object.values(section.pages).forEach((page) => {
      page.progress = { ...initialProgress }
      page.state
        .filter(({ element }) => {
          const { category, isVisible, isEditable } = element as ElementState
          return isVisible && isEditable && category === TemplateElementCategory.Question
        })
        .forEach(({ element, response, isChangeRequest, isChanged }) => {
          const { progress } = page
          const { isRequired } = element as ElementState
          const isChangeRequestNotDone = isChangeRequest && !isChanged

          if (isRequired) progress.totalRequired++
          else progress.totalNonRequired++
          // Considering not done change requests as not completed
          if (response?.text && !isChangeRequestNotDone) {
            if (isRequired) progress.doneRequired++
            else progress.doneNonRequired++
          }
          if (!!response?.text && response?.isValid == false) progress.valid = false
          // Considering not done change requests as not valid
          if (isChangeRequestNotDone) progress.valid = false
          progress.totalSum = progress.totalRequired + progress.doneNonRequired
          progress.completed = calculateCompleted(
            progress.totalSum,
            progress.doneRequired,
            progress.doneNonRequired
          )
        })
      updateFirstInvalid(section, page)
    })
    section.progress = getSectionProgress(Object.values(section.pages))
  })
  structure.info.firstStrictInvalidPage = firstIncompleteSectionCode
    ? {
        sectionCode: firstIncompleteSectionCode,
        pageNumber: firstStrictInvalidPageInSection,
      }
    : null
}

export default generateApplicantResponsesProgress
