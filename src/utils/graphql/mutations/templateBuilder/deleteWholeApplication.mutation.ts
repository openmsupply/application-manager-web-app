import { gql } from '@apollo/client'

export default gql`
  mutation deleteWholeApplication($id: Int!) {
    deleteWholeApplication(input: { applicationId: $id }) {
      clientMutationId
    }
  }
`
