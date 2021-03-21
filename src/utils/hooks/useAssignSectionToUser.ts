import {
  useAssignSectionToUserMutation,
  ReviewAssignmentStatus,
  ReviewAssignmentPatch,
  TemplateElementCategory,
  Trigger,
} from '../generated/graphql'
import { AssignmentDetailsNEW, FullStructure } from '../types'

// below lines are used to get return type of the function that is returned by UseAssignSectionToUserMutation
type UseAssignSectionToUserMutationReturnType = ReturnType<typeof useAssignSectionToUserMutation>
type PromiseReturnType = ReturnType<UseAssignSectionToUserMutationReturnType[0]>
// hook used to restart a review, , as per type definition below (returns promise that resolve with mutation result data)
type UseAssignSectionToUser = (props: {
  sectionCode?: string
  structure: FullStructure
}) => (assignment: AssignmentDetailsNEW, isSelfAssignment?: boolean) => PromiseReturnType

type ConstructAssignmentPatch = (isSelfAssignment: boolean) => ReviewAssignmentPatch

// Need to duplicate or create new review responses for all assigned questions
const useAssignSectionToUser: UseAssignSectionToUser = ({ sectionCode, structure }) => {
  const [updateAssignment] = useAssignSectionToUserMutation()

  const constructAssignmentPatch: ConstructAssignmentPatch = (isSelfAssignment) => {
    const elements = Object.values(structure?.elementsById || {})
    const assignableElements = elements.filter(
      (element) =>
        (!sectionCode || element.element.sectionCode === sectionCode) &&
        element.element.category === TemplateElementCategory.Question
    )

    console.log(sectionCode, elements, assignableElements, structure)

    const createReviewQuestionAssignments = assignableElements.map((element) => ({
      templateElementId: element.element.id,
    }))

    return {
      status: ReviewAssignmentStatus.Assigned,
      trigger: isSelfAssignment ? Trigger.OnReviewSelfAssign : Trigger.OnReviewAssign,
      timeCreated: new Date().toISOString(),
      reviewQuestionAssignmentsUsingId: {
        create: createReviewQuestionAssignments,
      },
    }
  }

  const assign = async (assignment: AssignmentDetailsNEW, isSelfAssignment = false) =>
    updateAssignment({
      variables: {
        assignmentId: assignment.id,
        assignmentPatch: constructAssignmentPatch(isSelfAssignment),
      },
    })

  return assign
}

export default useAssignSectionToUser
