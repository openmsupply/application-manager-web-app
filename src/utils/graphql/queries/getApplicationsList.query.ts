import { gql } from '@apollo/client'

export default gql`
  query getApplicationList(
    $filters: ApplicationListShapeFilter
    $sortFields: [ApplicationListShapesOrderBy!]
    $paginationOffset: Int!
    $numberToFetch: Int!
    $reviewerId: Int!
  ) {
    applicationList(
      filter: $filters
      orderBy: $sortFields
      offset: $paginationOffset
      first: $numberToFetch
      reviewerid: $reviewerId
    ) {
      nodes {
        id
        serial
        name
        templateCode
        templateName
        applicant
        applicantFirstName
        applicantLastName
        applicantUsername
        orgName
        stage
        status
        outcome
        lastActiveDate
        reviewAssignedCount
        reviewAssignedNotStartedCount
        reviewAvailableForSelfAssignmentCount
        reviewDraftCount
        reviewChangeRequestCount
        reviewSubmittedCount
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
