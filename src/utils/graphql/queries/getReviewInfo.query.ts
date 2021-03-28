import { gql } from '@apollo/client'

export default gql`
  query getReviewInfo($applicationId: Int, $assignerId: Int!) {
    reviewAssignments(condition: { applicationId: $applicationId }, orderBy: TIME_CREATED_DESC) {
      nodes {
        id
        level
        status
        timeCreated
        level
        reviewerId
        isLastLevel
        templateSectionRestrictions
        reviewer {
          id
          firstName
          lastName
        }
        reviews {
          nodes {
            id
            status
            timeStatusCreated
            trigger
            isLastLevel
            reviewDecisions(orderBy: TIME_UPDATED_DESC) {
              nodes {
                id
                # don't want to get comment here (it is queried and set independently, to re-fireing of useGetReviewInfo when comment changed)
                decision
              }
            }
          }
        }
        stage {
          title
          id
        }
        reviewQuestionAssignments {
          nodes {
            id
            templateElementId
            assignedReviewers {
              nodes {
                id
                username
                firstName
                lastName
              }
            }
            templateElement {
              id
              section {
                id
                code
              }
            }
          }
        }
        reviewAssignmentAssignerJoins(filter: { assignerId: { equalTo: $assignerId } }) {
          nodes {
            id
            assigner {
              firstName
              lastName
              username
              id
            }
          }
        }
      }
    }
  }
`
