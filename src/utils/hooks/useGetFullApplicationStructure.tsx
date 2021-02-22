import { useState, useEffect } from 'react'
import {
  ElementStateNEW,
  FullStructure,
  PageElement,
  ResponseFull,
  ResponsesByCode,
  TemplateElementStateNEW,
} from '../types'
import { ApplicationResponse, useGetAllResponsesQuery } from '../generated/graphql'
import { useUserState } from '../../contexts/UserState'
import evaluateExpression from '@openmsupply/expression-evaluator'

async function evaluateElements(elements: TemplateElementStateNEW[], evaluationObject: any) {
  const promiseArray: Promise<ElementStateNEW>[] = []
  elements.forEach((element) => {
    promiseArray.push(evaluateSingleElement(element, evaluationObject))
  })
  return await Promise.all(promiseArray)
}

const evaluateExpressionWithFallBack = (
  exrepssion: any,
  parametersObject: any,
  fallBackValue: any
) =>
  new Promise(async (resolve) => {
    try {
      resolve(await evaluateExpression(exrepssion, parametersObject))
    } catch (e) {
      console.log(e)
      resolve(fallBackValue)
    }
  })

async function evaluateSingleElement(
  element: TemplateElementStateNEW,
  evaluationObject: any
): Promise<ElementStateNEW> {
  const evaluationParameters = {
    objects: evaluationObject,
    // TO-DO: Also send org objects etc.
    // graphQLConnection: TO-DO
  }
  console.log({ evaluationParameters, isEditableExpression: element.isEditableExpression })

  const isEditable = evaluateExpressionWithFallBack(
    element.isEditableExpression,
    evaluationParameters,
    false
  )
  const isRequired = evaluateExpressionWithFallBack(
    element.isRequiredExpression,
    evaluationParameters,
    false
  )
  const isVisible = evaluateExpressionWithFallBack(
    element.isVisibleExpression,
    evaluationParameters,
    false
  )
  const results = await Promise.all([isEditable, isRequired, isVisible])
  const evaluatedElement = {
    ...element,
    isEditable: results[0] as boolean,
    isRequired: results[1] as boolean,
    isVisible: results[2] as boolean,
  }
  return evaluatedElement
}

const useGetFullApplicationStructure = (structure: FullStructure, firstRunValidation = true) => {
  const {
    info: { serial },
  } = structure
  const {
    userState: { currentUser },
  } = useUserState()
  const [fullStructure, setFullStructure] = useState<FullStructure>()
  const [responsesByCode, setResponsesByCode] = useState<ResponsesByCode>({})
  const [isLoading, setIsLoading] = useState(true)
  const [firstRunProcessValidation] = useState(firstRunValidation)

  console.log({ structure })
  const newStructure = { ...structure } // This MIGHT need to be deep-copied

  const networkFetch = true // To-DO: make this conditional
  const { data, error, loading } = useGetAllResponsesQuery({
    variables: {
      serial,
    },
    skip: !serial,
    // To-do: figure out why "network-only" throws error
    fetchPolicy: networkFetch ? 'no-cache' : 'cache-first',
  })
  interface ResponseObject {
    [key: string]: ResponseFull
  }

  useEffect(() => {
    if (!data) return
    setIsLoading(true)

    // Build responses by code (and only keep latest)
    const responseObject: any = {}
    const responseArray = data?.applicationBySerial?.applicationResponses
      ?.nodes as ApplicationResponse[]
    responseArray?.forEach((response) => {
      const { id, isValid, value, templateElement, timeCreated } = response
      const code = templateElement?.code as string
      if (!(code in responseObject) || timeCreated > responseObject[code].timeCreated)
        responseObject[code] = {
          id,
          isValid,
          timeCreated,
          ...value,
        }
    })

    const flattenedElements = flattenStructureElements(newStructure)
    console.log({ flattenedElements, responseObject })
    // Note: Flattened elements are evaluated IN-PLACE, so structure can be
    // updated with evaluated elements and responses without re-building
    // structure
    evaluateElements(
      flattenedElements.map((elem: PageElement) => elem.element),
      { responses: responseObject, currentUser }
    ).then((result) => {
      result.forEach((evaluatedElement, index) => {
        flattenedElements[index].element = evaluatedElement
        flattenedElements[index].response = responseObject[evaluatedElement.code]
      })
      setFullStructure(newStructure)
      setResponsesByCode(responseObject)
      setIsLoading(false)
    })
  }, [data])

  return { fullStructure, error, isLoading: loading || isLoading, responsesByCode }
}

export default useGetFullApplicationStructure

const flattenStructureElements = (structure: FullStructure) => {
  const flattened: any = []
  Object.keys(structure.sections).forEach((section) => {
    Object.keys(structure.sections[section].pages).forEach((page) => {
      flattened.push(...structure.sections[section].pages[page].state)
    })
  })
  return flattened
}
