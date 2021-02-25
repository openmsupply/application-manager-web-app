import { useState, useEffect } from 'react'
import {
  ElementStateNEW,
  EvaluatorParameters,
  FullStructure,
  PageElement,
  ResponsesByCode,
  TemplateElementStateNEW,
} from '../types'
import { ApplicationResponse, useGetAllResponsesQuery } from '../generated/graphql'
import { useUserState } from '../../contexts/UserState'
import evaluateExpression from '@openmsupply/expression-evaluator'
import { IQueryNode } from '@openmsupply/expression-evaluator/lib/types'

interface useGetFullApplicationStructureProps {
  structure: FullStructure
  shouldProcessValidation?: boolean
  firstRunValidation?: boolean
}

const useGetFullApplicationStructure = ({
  structure,
  shouldProcessValidation,
  firstRunValidation,
}: useGetFullApplicationStructureProps) => {
  const {
    info: { serial },
  } = structure
  const {
    userState: { currentUser },
  } = useUserState()
  const [fullStructure, setFullStructure] = useState<FullStructure>()
  const [responsesByCode, setResponsesByCode] = useState<ResponsesByCode>()
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [firstRunProcessValidation, setFirstRunProcessValidation] = useState(
    firstRunValidation || true
  )
  const [lastValidationTimestamp, setLastValidationTimestamp] = useState<number>()

  const newStructure = { ...structure } // This MIGHT need to be deep-copied

  const networkFetch = true // To-DO: make this conditional
  const { data, error, loading } = useGetAllResponsesQuery({
    variables: {
      serial,
    },
    skip: !serial,
    fetchPolicy: networkFetch ? 'network-only' : 'cache-first',
  })

  useEffect(() => {
    if (loading) {
      return
    }

    if (error) {
      setIsError(true)
      return
    }

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

    const evaluationParameters = {
      objects: { responses: responseObject, currentUser },
      APIfetch: fetch,
      // TO-DO: Also send org objects etc.
      // graphQLConnection: TO-DO
    }

    // Note: Flattened elements are evaluated IN-PLACE, so structure can be
    // updated with evaluated elements and responses without re-building
    // structure
    evaluateAndValidateElements(
      flattenedElements.map((elem: PageElement) => elem.element),
      responseObject,
      evaluationParameters
    ).then((result) => {
      result.forEach((evaluatedElement, index) => {
        flattenedElements[index].element = evaluatedElement
        flattenedElements[index].response = responseObject[evaluatedElement.code]
      })
      if (shouldProcessValidation || firstRunProcessValidation)
        setLastValidationTimestamp(Date.now())
      generateProgressStructure(newStructure) // To-Do
      setFirstRunProcessValidation(false)
      setFullStructure(newStructure)
      setResponsesByCode(responseObject)
      setIsLoading(false)
    })
  }, [data, error, loading, structure])

  async function evaluateAndValidateElements(
    elements: TemplateElementStateNEW[],
    responseObject: ResponsesByCode,
    evaluationParameters: EvaluatorParameters
  ) {
    const elementPromiseArray: Promise<ElementStateNEW>[] = []
    elements.forEach((element) => {
      elementPromiseArray.push(evaluateSingleElement(element, responseObject, evaluationParameters))
    })
    return await Promise.all(elementPromiseArray)
  }

  const evaluateExpressionWithFallBack = (
    expression: IQueryNode,
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
    element: TemplateElementStateNEW,
    responseObject: ResponsesByCode,
    evaluationParameters: EvaluatorParameters
  ): Promise<ElementStateNEW> {
    const responses = { ...evaluationParameters.objects?.responses }
    const currentEvaluationParameters = {
      ...evaluationParameters,
      objects: {
        ...evaluationParameters.objects,
        responses: {
          ...evaluationParameters.objects?.responses,
          thisResponse: responses?.[element.code]?.text,
        },
      },
    }

    const isEditable = evaluateExpressionWithFallBack(
      element.isEditableExpression,
      currentEvaluationParameters,
      true
    )
    const isRequired = evaluateExpressionWithFallBack(
      element.isRequiredExpression,
      currentEvaluationParameters,
      false
    )
    const isVisible = evaluateExpressionWithFallBack(
      element.isVisibleExpression,
      currentEvaluationParameters,
      true
    )
    const isValid =
      shouldProcessValidation || firstRunProcessValidation
        ? evaluateExpressionWithFallBack(
            element.validationExpression,
            currentEvaluationParameters,
            false
          )
        : async () => responseObject[element.code]?.isValid
    const results = await Promise.all([isEditable, isRequired, isVisible, isValid])

    const evaluatedElement = {
      ...element,
      isEditable: results[0] as boolean,
      isRequired: results[1] as boolean,
      isVisible: results[2] as boolean,
    }
    // Update isValid field in Response, in-place
    if (responseObject[element.code]) responseObject[element.code].isValid = results[3] as boolean
    return evaluatedElement
  }

  return {
    fullStructure,
    responsesByCode,
    error: isError ? error : false,
    isLoading: loading || isLoading,
    lastValidationTimestamp,
  }
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

const generateProgressStructure = (structure: FullStructure) => {
  // TO-DO:
  // Calculate all Progress objects and update structure in-place
  // Shouldn't return anything
}
