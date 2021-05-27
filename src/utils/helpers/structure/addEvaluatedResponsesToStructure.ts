import evaluateExpression from '@openmsupply/expression-evaluator'
import { ApplicationResponse, ReviewResponse } from '../../generated/graphql'
import {
  ElementState,
  EvaluatorNode,
  EvaluatorParameters,
  FullStructure,
  PageElement,
  ResponsesByCode,
  User,
  ApplicationDetails,
} from '../../types'
import config from '../../../config'
const graphQLEndpoint = config.serverGraphQL

type EvaluationOptions = {
  isRequired: boolean
  isVisible: boolean
  isEditable: boolean
  isValid: boolean
}

const evaluationMapping = {
  isEditable: 'isEditableExpression',
  isRequired: 'isRequiredExpression',
  isVisible: 'isVisibleExpression',
  isValid: 'validationExpression',
}

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
  const results = await evaluateAndValidateElements(
    flattenedElements.map((elem: PageElement) => elem.element as ElementState),
    responseObject,
    currentUser,
    structure.info, // i.e. applicationData
    evaluationOptions
  )
  results.forEach((evaluatedElement, index) => {
    const flattenedElement = flattenedElements[index]
    flattenedElement.element = evaluatedElement
    flattenedElement.response = responseObject[evaluatedElement.code]
    if (flattenedElement.response)
      flattenedElement.response.reviewResponse = reviewResponses[flattenedElement.element.id]
  })
  newStructure.responsesByCode = responseObject
  return newStructure
}

async function evaluateAndValidateElements(
  elements: ElementState[],
  responseObject: ResponsesByCode,
  currentUser: User | null,
  applicationData: ApplicationDetails,
  evaluationOptions: EvaluationOptions
) {
  const elementPromiseArray: Promise<ElementState>[] = []
  elements.forEach((element) => {
    elementPromiseArray.push(
      evaluateSingleElement(
        element,
        responseObject,
        currentUser,
        applicationData,
        evaluationOptions
      )
    )
  })
  return await Promise.all(elementPromiseArray)
}

const evaluateExpressionWithFallBack = (
  expression: EvaluatorNode,
  evaluationParameters: EvaluatorParameters,
  fallBackValue: any
) =>
  new Promise(async (resolve) => {
    try {
      resolve(await evaluateExpression(expression, evaluationParameters))
    } catch (e) {
      console.log(e)
      resolve(fallBackValue)
    }
  })

async function evaluateSingleElement(
  element: ElementState,
  responseObject: ResponsesByCode,
  currentUser: User | null,
  applicationData: ApplicationDetails,
  evaluationOptions: EvaluationOptions
): Promise<ElementState> {
  const evaluationParameters = {
    objects: {
      responses: { ...responseObject, thisResponse: responseObject?.[element.code]?.text },
      currentUser,
      applicationData,
    },
    APIfetch: fetch,
    graphQLConnection: { fetch: fetch.bind(window), endpoint: graphQLEndpoint },
    // TO-DO: Also send org objects etc.
    // graphQLConnection: TO-DO
  }

  const evaluationKeys = Object.keys(evaluationMapping).filter(
    (evaluationKey) => evaluationOptions[evaluationKey as keyof EvaluationOptions]
  )

  const evaluations = evaluationKeys.map((evaluationKey) => {
    const elementKey = evaluationMapping[evaluationKey as keyof EvaluationOptions]
    const evaluationExpression = element[elementKey as keyof ElementState]

    return evaluateExpressionWithFallBack(evaluationExpression, evaluationParameters, true)
  })

  const results = (await Promise.all(evaluations)) as any
  const evaluatedElement: { [key: string]: any } = {}

  evaluationKeys.forEach((evaluationKey, index) => {
    if (evaluationKey !== 'isValid') {
      evaluatedElement[evaluationKey] = results[index]
      return
    }
    // TODO maybe it's better to not mutate responseObject but add element.isValid
    if (responseObject[element.code]) responseObject[element.code].isValid = results[index]
  })

  const elementBase = {
    isEditable: true,
    isVisible: true,
    isRequired: true,
  }
  return { ...element, ...elementBase, ...evaluatedElement }
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
