import { gql } from '@apollo/client'

export default gql`
  mutation updateReviewResponse(
    $id: Int!
    $decision: ReviewResponseDecision
    $comment: String
    $recommendedApplicantVisibility: ReviewResponseRecommendedApplicantVisibility = ORIGINAL_RESPONSE_NOT_VISIBLE_TO_APPLICANT
  ) {
    updateReviewResponse(
      input: {
        id: $id
        patch: {
          decision: $decision
          comment: $comment
          recommendedApplicantVisibility: $recommendedApplicantVisibility
        }
      }
    ) {
      reviewResponse {
        ...reviewResponseFragment
      }
    }
  }
`
