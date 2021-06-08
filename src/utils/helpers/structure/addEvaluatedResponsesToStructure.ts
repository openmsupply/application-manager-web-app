import { ApplicationResponse, ReviewResponse } from '../../generated/graphql'
import {
  FullStructure,
  PageElement,
  User,
  ElementForEvaluation,
  EvaluationOptions,
} from '../../types'
import { evaluateElements } from '../evaluateElements'

const addEvaluatedResponsesToStructure = async ({
  structure,
  applicationResponses,
  currentUser,
  evaluationOptions,
}: {
  structure: FullStructure
  applicationResponses: ApplicationResponse[]
  currentUser: User | null
  evaluationOptions: EvaluationOptions
}) => {
  const newStructure = { ...structure } // This MIGHT need to be deep-copied

  // Build responses by code (and only keep latest)
  const responseObject: any = {}
  const reviewResponses: { [templateElementId: string]: ReviewResponse } = {}

  applicationResponses?.forEach((response) => {
    const { id, isValid, value, templateElement, templateElementId, timeUpdated } = response
    const code = templateElement?.code as string
    if (!(code in responseObject) || timeUpdated > responseObject[code].timeCreated) {
      responseObject[code] = {
        id,
        isValid,
        timeUpdated,
        ...value,
      }

      if (response.reviewResponses.nodes.length === 0) return
      if (!templateElementId) return
      // Responses should be orderd by timestamp in GraphQL query
      reviewResponses[templateElementId] = response.reviewResponses.nodes[0] as ReviewResponse
    }
  })

  const flattenedElements = flattenStructureElements(newStructure)

  // Note: Flattened elements are evaluated IN-PLACE, so structure can be
  // updated with evaluated elements and responses without re-building
  // structure
  const results = await evaluateElements(
    flattenedElements.map((elem: PageElement) => elem.element as ElementForEvaluation),
    evaluationOptions,
    {
      responseObject,
      currentUser,
      applicationData: structure.info,
    }
  )

  results.forEach((evaluatedElement, index) => {
    const flattenedElement = flattenedElements[index]
    const { element } = flattenedElement
    flattenedElement.element = { ...element, ...evaluatedElement }
    flattenedElement.response = responseObject[element.code]

    if (!flattenedElement.response) return

    if (typeof evaluatedElement.isValid != undefined) {
      flattenedElement.response.isValid = evaluatedElement.isValid
    }

    flattenedElement.response.reviewResponse = reviewResponses[flattenedElement.element.id]
  })
  newStructure.responsesByCode = responseObject
  return newStructure
}

const flattenStructureElements = (structure: FullStructure) => {
  const flattened: PageElement[] = []
  Object.keys(structure.sections).forEach((section) => {
    Object.keys(structure.sections[section].pages).forEach((page) => {
      flattened.push(...structure.sections[section].pages[Number(page)].state)
    })
  })
  return flattened
}

export default addEvaluatedResponsesToStructure
