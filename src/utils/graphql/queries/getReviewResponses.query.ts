import { gql } from '@apollo/client'

// For review responses linked to applicationResponses, we want to get either submitted responses
// Or draft response that belong to current user
export default gql`
  query getReviewResponses(
    $reviewAssignmentId: Int!
    $userId: Int!
    $sectionIds: [Int!]
    $applicationId: Int!
    $previousLevel: Int!
    $stageNumber: Int!
  ) {
    thisReviewResponses: reviewResponses(
      orderBy: TIME_UPDATED_DESC
      filter: {
        review: { reviewAssignmentId: { equalTo: $reviewAssignmentId } }
        templateElement: { section: { id: { in: $sectionIds } } }
        or: [
          { status: { notEqualTo: DRAFT } }
          {
            and: [
              { status: { equalTo: DRAFT } }
              { review: { reviewer: { id: { equalTo: $userId } } } }
            ]
          }
        ]
      }
    ) {
      nodes {
        ...reviewResponseFragment
        ...consolidatorResponseFragment
      }
    }
    previousLevelReviewResponses: reviewResponses(
      orderBy: TIME_UPDATED_DESC
      filter: {
        review: {
          applicationId: { equalTo: $applicationId }
          levelNumber: { equalTo: $previousLevel }
          stageNumber: { equalTo: $stageNumber }
        }
        templateElement: { section: { id: { in: $sectionIds } } }
        status: { notEqualTo: DRAFT }
      }
    ) {
      nodes {
        ...reviewResponseFragment
      }
    }
    originalReviewResponses: reviewResponses(
      orderBy: TIME_UPDATED_DESC
      filter: {
        review: {
          applicationId: { equalTo: $applicationId }
          levelNumber: { equalTo: 1 }
          stageNumber: { equalTo: $stageNumber }
        }
        templateElement: { section: { id: { in: $sectionIds } } }
        status: { notEqualTo: DRAFT }
      }
    ) {
      nodes {
        ...reviewResponseFragment
      }
    }
  }
`
