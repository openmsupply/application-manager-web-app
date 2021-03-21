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
        templateSectionRestrictions
        isLastLevel
        reviewer {
          id
          firstName
          lastName
        }
        reviewAssignmentAssignerJoins(filter: { assignerId: { equalTo: $assignerId } }) {
          nodes {
            assigner {
              firstName
              lastName
              id
            }
          }
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
            templateElement {
              id
              section {
                id
                code
              }
            }
          }
        }
      }
    }
  }
`
