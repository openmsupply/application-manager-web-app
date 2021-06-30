import { ApplicationResponse } from '../../generated/graphql'
import { FullStructure } from '../../types'

const addApplicationResponses = (
  structure: FullStructure,
  applicationResponses: ApplicationResponse[]
) => {
  // Application response are ordered by timestamps, if we group them by template element, should be easy to get latest and previous
  const groupedApplicationResponse: { [key: string]: ApplicationResponse[] } = {}

  // Group Application responses by templateElement id
  applicationResponses?.forEach((applicationResponse) => {
    const templateElementId = applicationResponse?.templateElementId || ''
    if (!groupedApplicationResponse[templateElementId])
      groupedApplicationResponse[templateElementId] = []

    groupedApplicationResponse[templateElementId].push(applicationResponse)
  })
  // Attach latest and previous application response to element
  Object.entries(groupedApplicationResponse).forEach(
    ([templateElementId, groupedApplicationResponses]) => {
      const element = structure?.elementsById?.[templateElementId]
      if (!element) return

      element.latestApplicationResponse = groupedApplicationResponses[0]
      element.previousApplicationResponse = groupedApplicationResponses[1] // will be undefined if doesn't exist

      element.enableViewHistory =
        groupedApplicationResponses.length > 2 ||
        (element.latestApplicationResponse && element.previousApplicationResponse
          ? element.latestApplicationResponse.value.text !==
            element.previousApplicationResponse.value.text
          : false)
    }
  )
}

export default addApplicationResponses
