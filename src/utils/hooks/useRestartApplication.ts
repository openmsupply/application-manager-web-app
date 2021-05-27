import {
  ApplicationPatch,
  TemplateElementCategory,
  Trigger,
  useRestartApplicationMutation,
} from '../generated/graphql'
import { FullStructure } from '../types'

// below lines are used to get return type of the function that is returned by useRestartApplicationMutation
type UseRestartApplicationMutation = ReturnType<typeof useRestartApplicationMutation>
type PromiseReturnType = ReturnType<UseRestartApplicationMutation[0]>
// hook used to submit review, , as per type definition below (returns promise that resolve with mutation result data)
type UseRestartApplication = (serial: string) => (structure: FullStructure) => PromiseReturnType

type ConstructRestartApplicationPatch = (structure: FullStructure) => ApplicationPatch

const useRestartApplication: UseRestartApplication = (serial) => {
  const [restartApplicationMutation] = useRestartApplicationMutation()
  // During re-submission, we still allow for changed to questions that are not in LOQ, thus re-submitting the whole application
  const constructRestartApplicationPatch: ConstructRestartApplicationPatch = (structure) => {
    const reviewableElements = Object.values(structure.elementsById || {}).filter(
      (element) => element.element.category === TemplateElementCategory.Question
    )

    const applicationResponsesCreate = reviewableElements.map((element) => ({
      templateElementId: element.element.id,
      value: element?.latestApplicationResponse?.value,
    }))
    // See comment at the bottom of file for resulting shape
    return {
      trigger: Trigger.OnApplicationRestart,
      applicationResponsesUsingId: {
        create: applicationResponsesCreate,
      },
    }
  }

  const restartApplication = async (structure: FullStructure) =>
    await restartApplicationMutation({
      variables: {
        serial,
        // See comment at the bottom of file for resulting shape
        applicationPatch: constructRestartApplicationPatch(structure),
      },
    })

  return restartApplication
}

export default useRestartApplication

/* shape of applicationPath
{
  "trigger": "ON_APPLICATION_RESTART",
  "applicationResponsesUsingId": {
    "create": [
      {
        "templateElementId": 4000
      }
    ]
  }
}
*/
