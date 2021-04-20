import { gql } from '@apollo/client'

// TODO, filter by is visible (review response)
export default gql`
  query getAllResponses($serial: String!, $responseStatuses: [ApplicationResponseStatus!]) {
    applicationBySerial(serial: $serial) {
      id
      serial
      # TODO also filter out drafts, to be only visible to applicant
      applicationResponses(
        orderBy: TIME_UPDATED_DESC
        filter: { status: { in: $responseStatuses } }
      ) {
        nodes {
          ...Response
          reviewResponses(condition: { isVisibleToApplicant: true }) {
            nodes {
              ...reviewResponseFragment
            }
          }
        }
      }
    }
  }
`
