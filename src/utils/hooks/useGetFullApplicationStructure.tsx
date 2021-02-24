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
  shouldRevalidate?: boolean
  revalidateAfterTimestamp?: number
  firstRunValidation?: boolean
}

const useGetFullApplicationStructure = ({
  structure,
  shouldRevalidate = false,
  revalidateAfterTimestamp = 0,
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
  const [previousSerial, setPreviousSerial] = useState<string>('')

  const newStructure = { ...JSON.parse(JSON.stringify(structure)) } // This MIGHT need to be deep-copied

  const networkFetch = true // To-DO: make this conditional
  const { data, error, loading } = useGetAllResponsesQuery({
    variables: {
      serial,
    },
    skip: !serial,
    fetchPolicy: networkFetch ? 'network-only' : 'cache-first',
  })

  useEffect(() => {
    const {
      info: { serial },
    } = structure

    if (!previousSerial) {
      setPreviousSerial(serial)
      return
    }
    if (serial != previousSerial) {
      setPreviousSerial(serial)
      setLastProcessedTimestamp(0)
    }
  }, [structure])

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
    const shouldRevalidationWaitForRefetech = revalidateAfterTimestamp > lastRefetchedTimestamp
    const shouldRevalidateThisRun = shouldRevalidate && !shouldRevalidationWaitForRefetech

    if (isDataUpToDate && !shouldRevalidateThisRun) return

    // Build responses by code (and only keep latest)
    const responseObject: any = {}
    const fullResponsesByCode: any = {}
    const responseArray = JSON.parse(
      JSON.stringify(data?.applicationBySerial?.applicationResponses?.nodes)
    ) as ApplicationResponse[]
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
      fullResponsesByCode[code] = response
    })

    const flattenedElements = flattenStructureElements(newStructure)

    const evaluationParameters = {
      objects: { responses: responseObject, currentUser },
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

      setLastProcessedTimestamp(Date.now())
      setFirstRunProcessValidation(false)
      setFullStructure(newStructure)
    })
  }, [lastRefetchedTimestamp, shouldRevalidate, revalidateAfterTimestamp, error])

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
    fallBackValue: any,
    element: any
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
    const evaluatoParametersForElement = {
      APIfetch: fetch,
      objects: {
        currentUser: evaluationParameters.objects.currentUser,

        responses: {
          ...evaluationParameters.objects.responses,
          thisResponse: responseObject[element.code]?.text || '',
        },
      },
    }

    const isEditable = evaluateExpressionWithFallBack(
      element.isEditableExpression,
      evaluatoParametersForElement,
      true,
      element
    )
    const isRequired = evaluateExpressionWithFallBack(
      element.isRequiredExpression,
      evaluatoParametersForElement,
      false,
      element
    )
    const isVisible = evaluateExpressionWithFallBack(
      element.isVisibleExpression,
      evaluatoParametersForElement,
      true,
      element
    )
    const isValid = shouldValidate
      ? evaluateExpressionWithFallBack(
          element.validationExpression,
          evaluatoParametersForElement,
          false,
          element
        )
      : new Promise((resolve) => resolve(responseObject[element.code]?.isValid))

    const results = await Promise.all([isEditable, isRequired, isVisible, isValid])

    const evaluatedElement = {
      ...element,
      isEditable: results[0] as boolean,
      isRequired: results[1] as boolean,
      isVisible: results[2] as boolean,
    }
    // Update isValid field in Response, in-place
    if (responseObject[element.code]) responseObject[element.code].isValid = results[3] as boolean

    console.log({
      shouldValidate,
      isValid: results[3],
      elementCode: element.code,
      val: responseObject[element.code],
    })
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
