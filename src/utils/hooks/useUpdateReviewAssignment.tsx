import { useUserState } from '../../contexts/UserState'
import {
  useUpdateReviewAssignmentMutation,
  ReviewAssignmentStatus,
  ReviewAssignmentPatch,
  TemplateElementCategory,
  Trigger,
} from '../generated/graphql'
import { AssignmentDetails, FullStructure } from '../types'

// below lines are used to get return type of the function that is returned by useUpdateReviewAssignmentMutation
type UseUpdateReviewAssignmentMutationReturnType = ReturnType<
  typeof useUpdateReviewAssignmentMutation
>
type PromiseReturnType = ReturnType<UseUpdateReviewAssignmentMutationReturnType[0]>
// hook used to assign section/s to user as per type definition below (returns promise that resolve with mutation result data)
type UseUpdateReviewAssignment = (structure: FullStructure) => {
  assignSectionToUser: (props: {
    // Section code is optional if omitted all sections are assigned
    sectionCode?: string
    assignment: AssignmentDetails
    // isSelfAssignment defaults to false
    isSelfAssignment?: boolean
  }) => PromiseReturnType
}

type ConstructAssignSectionPatch = (
  sectionCode?: string,
  isSelfAssignment?: boolean
) => ReviewAssignmentPatch

const useUpdateReviewAssignment: UseUpdateReviewAssignment = (structure) => {
  const [updateAssignment] = useUpdateReviewAssignmentMutation()

  const {
    userState: { currentUser },
  } = useUserState()

  const constructAssignSectionPatch: ConstructAssignSectionPatch = (
    sectionCode,
    isSelfAssignment
  ) => {
    const elements = Object.values(structure?.elementsById || {})

    // filter elements by question category or by section code (if one passed through)
    const assignableElements = elements.filter(
      ({ element }) =>
        (!sectionCode || element.sectionCode === sectionCode) &&
        element.category === TemplateElementCategory.Question
    )

    const createReviewQuestionAssignments = assignableElements.map((element) => ({
      templateElementId: element.element.id,
    }))

    return {
      status: ReviewAssignmentStatus.Assigned,
      assignerId: currentUser?.userId,
      // onReviewSelfAssign will trigger core action to disallow other reviewers to self assign
      trigger: isSelfAssignment ? Trigger.OnReviewSelfAssign : Trigger.OnReviewAssign,
      timeUpdated: new Date().toISOString(),
      reviewQuestionAssignmentsUsingId: {
        create: createReviewQuestionAssignments,
      },
    }
  }

  return {
    assignSectionToUser: async ({ sectionCode, assignment, isSelfAssignment = false }) => {
      const result = await updateAssignment({
        variables: {
          assignmentId: assignment.id,
          assignmentPatch: constructAssignSectionPatch(sectionCode, isSelfAssignment),
        },
      })

      if (result.errors) throw new Error(result.errors.toString())
      return result
    },
  }
}

export default useUpdateReviewAssignment
