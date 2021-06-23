import { gql } from '@apollo/client'

// TODO: Use Fragments - Assignment Review and User ?
export default gql`
  query getReviewInfo($applicationId: Int, $assignerId: Int!) {
    reviewAssignments(condition: { applicationId: $applicationId }, orderBy: TIME_UPDATED_DESC) {
      nodes {
        id
        status
        timeUpdated
        levelNumber
        reviewerId
        isLastLevel
        allowedSections
        stage {
          id
          number
          title
          colour
        }
        stageDate
        trigger
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
        reviewQuestionAssignments {
          nodes {
            id
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
            assigner {
              firstName
              lastName
              id
            }
          }
        }
      }
    }
  }
`
