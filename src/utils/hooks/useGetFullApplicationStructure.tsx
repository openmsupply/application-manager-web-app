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
import { generateResponsesProgress } from '../helpers/structure/generateProgress'

interface useGetFullApplicationStructureProps {
  structure: FullStructure
  shouldRevalidate?: boolean
  minRefetchTimestampForRevalidation?: number
  firstRunValidation?: boolean
}

const useGetFullApplicationStructure = ({
  structure,
  shouldRevalidate = false,
  minRefetchTimestampForRevalidation = 0,
  firstRunValidation = true,
}: useGetFullApplicationStructureProps) => {
  const {
    info: { serial },
  } = structure
  const {
    userState: { currentUser },
  } = useUserState()
  const [fullStructure, setFullStructure] = useState<FullStructure>()
  const [isError, setIsError] = useState(false)
  const [firstRunProcessValidation, setFirstRunProcessValidation] = useState(firstRunValidation)

  const [lastRefetchedTimestamp, setLastRefetchedTimestamp] = useState<number>(0)
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState<number>(0)

  const newStructure = { ...structure } // This MIGHT need to be deep-copied

  const networkFetch = true // To-DO: make this conditional

  const { data, error, loading } = useGetAllResponsesQuery({
    variables: {
      serial,
    },
    skip: !serial,
    fetchPolicy: networkFetch ? 'network-only' : 'cache-first',
  })

  // TODO - might need a use effect if serial is changes (navigated to another application from current page)

  useEffect(() => {
    if (!data) return
    setLastRefetchedTimestamp(Date.now())
  }, [data])

  useEffect(() => {
    if (error) {
      setIsError(true)
      return
    }

    if (!data) return

    const isDataUpToDate = lastProcessedTimestamp > lastRefetchedTimestamp
    const shouldRevalidationWaitForRefetech =
      minRefetchTimestampForRevalidation > lastRefetchedTimestamp
    const shouldRevalidateThisRun = shouldRevalidate && !shouldRevalidationWaitForRefetech

    if (isDataUpToDate && !shouldRevalidateThisRun) return

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
      evaluationParameters,
      shouldRevalidateThisRun || firstRunProcessValidation
    ).then((result) => {
      result.forEach((evaluatedElement, index) => {
        flattenedElements[index].element = evaluatedElement
        flattenedElements[index].response = responseObject[evaluatedElement.code]
      })

      if (shouldRevalidateThisRun || firstRunProcessValidation) {
        newStructure.lastValidationTimestamp = Date.now()
      }

      newStructure.responsesByCode = responseObject

      generateResponsesProgress(newStructure)

      setLastProcessedTimestamp(Date.now())
      setFirstRunProcessValidation(false)
      setFullStructure(newStructure)
    })
  }, [lastRefetchedTimestamp, shouldRevalidate, minRefetchTimestampForRevalidation, error])

  async function evaluateAndValidateElements(
    elements: TemplateElementStateNEW[],
    responseObject: ResponsesByCode,
    evaluationParameters: EvaluatorParameters,
    shouldValidate: boolean
  ) {
    const elementPromiseArray: Promise<ElementStateNEW>[] = []
    elements.forEach((element) => {
      elementPromiseArray.push(
        evaluateSingleElement(element, responseObject, evaluationParameters, shouldValidate)
      )
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
    evaluationParameters: EvaluatorParameters,
    shouldValidate: boolean
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
    const isValid = shouldValidate
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
    error: isError ? error : false,
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
