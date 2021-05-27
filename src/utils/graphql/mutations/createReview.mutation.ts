import { gql } from '@apollo/client'

/* 
Need to use useCreateReview hook for this mutation, it creates the following shape for $reviewInput
(if used else where must set decision and trigger)

{
  "trigger": "ON_REVIEW_CREATE",
  "reviewAssignmentId": 4,
  "reviewResponsesUsingId": {
    "create": [
      {
        "applicationResponseId": 11,
        "reviewQuestionAssignmentId": 11
      }
    ]
  },
  "reviewDecisionsUsingId": {
    "create": [
      {
        "decision": "NO_DECISION"
      }
    ]
  }
}
*/

export default gql`
  mutation createReview($reviewInput: ReviewInput!) {
    createReview(input: { review: $reviewInput }) {
      review {
        id
        reviewAssignment {
          id
          reviews {
            nodes {
              id
            }
          }
        }
      }
    }
  }
`
