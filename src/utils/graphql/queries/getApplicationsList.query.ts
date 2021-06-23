import { gql } from '@apollo/client'

export default gql`
  query getApplicationList(
    $filters: ApplicationListShapeFilter
    $sortFields: [ApplicationListShapesOrderBy!]
    $paginationOffset: Int!
    $numberToFetch: Int!
    $userId: Int! = 0
  ) {
    applicationList(
      filter: $filters
      orderBy: $sortFields
      offset: $paginationOffset
      first: $numberToFetch
      userid: $userId
    ) {
      nodes {
        id
        serial
        name
        templateCode
        templateName
        applicant
        orgName
        stage
        stageColour
        status
        outcome
        lastActiveDate
        reviewerAction
        assignerAction
        assigners
        reviewers
        isFullyAssignedLevel1
        assignedQuestionsLevel1
        totalQuestions
      }
      # Use the page and count info for rendering Pagination UI
      pageInfo {
        hasPreviousPage
        hasNextPage
      }
      totalCount
    }
  }
`
