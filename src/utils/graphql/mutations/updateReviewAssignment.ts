import { gql } from '@apollo/client'

export default gql`
  mutation updateReviewAssignment($id: Int!, $data: ReviewAssignmentPatch!) {
    updateReviewAssignment(input: { id: $id, patch: $data }) {
      reviewAssignment {
        id
        status
      }
    }
  }
`
