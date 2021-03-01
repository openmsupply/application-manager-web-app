import { gql } from '@apollo/client'

export default gql`
  query getReviewAssignmentDemo($reviewerId: Int!, $applicationSerialNumber: String) {
    reviewAssignments(
      filter: {
        reviewerId: { equalTo: $reviewerId }
        application: { serial: { equalTo: $applicationSerialNumber } }
      }
    ) {
      nodes {
        id
        applicationId
        application {
          id
          serial
          applicationResponses {
            nodes {
              id
            }
          }
        }
        reviewer {
          id
          username
          firstName
          lastName
        }
        stageId
        level
        status
        stage {
          title
        }
        reviews {
          nodes {
            id
            status
            reviewResponses {
              nodes {
                id
                comment
                decision
                applicationResponse {
                  id
                }
              }
            }
          }
        }
        reviewQuestionAssignments {
          nodes {
            templateElement {
              code
              section {
                id
                index
              }
              applicationResponses {
                nodes {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`
